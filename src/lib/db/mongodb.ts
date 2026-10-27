import "server-only";
import { GridFSBucket, MongoClient, type Db } from "mongodb";
import type { Collections } from "./models";

/** Thrown when MONGODB_URI is not configured, so routes can answer 503 instead of crashing. */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not set. Add your MongoDB Atlas connection string to .env.local.");
  }
}

type Cache = { client: Promise<MongoClient> | null; indexes: Promise<void> | null; uri?: string; dbName?: string };

// One client per process, reused across requests and development hot reloads.
const globalCache = globalThis as typeof globalThis & { __mncMongo?: Cache };
const cache: Cache = globalCache.__mncMongo ?? (globalCache.__mncMongo = { client: null, indexes: null });

function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseNotConfiguredError();
  if (cache.client && cache.uri !== uri) {
    // The connection string changed (e.g. .env edited while the dev server runs): reconnect with it.
    void cache.client.then((stale) => stale.close()).catch(() => undefined);
    cache.client = null;
    cache.indexes = null;
  }
  if (!cache.client) {
    cache.uri = uri;
    cache.client = new MongoClient(uri, { appName: "mnc-global-connect", maxPoolSize: 10 }).connect()
      .catch((error: unknown) => {
        cache.client = null;
        throw error;
      });
  }
  return cache.client;
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("sessions").createIndex({ userId: 1 }),
    db.collection("passwordTokens").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("passwordTokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("applications").createIndex({ reference: 1 }, { unique: true }),
    db.collection("applications").createIndex({ "applicant.email": 1, status: 1 }),
    db.collection("applications").createIndex({ status: 1, createdAt: -1 }),
    db.collection("contactEnquiries").createIndex({ createdAt: -1 }),
    db.collection("newsletterSubscribers").createIndex({ email: 1 }, { unique: true }),
  ]);
}

export async function getDb(): Promise<Db> {
  const client = await connect();
  const dbName = process.env.MONGODB_DB || "mnc_global_connect";
  const db = client.db(dbName);
  if (cache.dbName !== dbName) {
    cache.dbName = dbName;
    cache.indexes = null;
  }
  if (!cache.indexes) {
    cache.indexes = ensureIndexes(db).catch((error: unknown) => {
      cache.indexes = null;
      throw error;
    });
  }
  await cache.indexes;
  return db;
}

export async function collections(): Promise<Collections> {
  const db = await getDb();
  return {
    users: db.collection("users"),
    sessions: db.collection("sessions"),
    passwordTokens: db.collection("passwordTokens"),
    applications: db.collection("applications"),
    contactEnquiries: db.collection("contactEnquiries"),
    newsletterSubscribers: db.collection("newsletterSubscribers"),
  };
}

/** GridFS bucket holding uploaded verification documents. */
export async function documentBucket() {
  return new GridFSBucket(await getDb(), { bucketName: "applicationDocuments" });
}
