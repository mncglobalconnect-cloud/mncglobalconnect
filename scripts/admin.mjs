// Membership admin commands. Run with the project's environment, e.g.:
//   npm run admin -- list
//   npm run admin -- approve MNC-1A2B3C
//   npm run admin -- reject MNC-1A2B3C
//   npm run admin -- password-link member@company.com
//   npm run admin -- create-admin you@company.com "Your Name"
//   npm run admin -- unlock you@company.com          (clear a lockout from failed sign-ins)
//   ADMIN_PASSWORD=... npm run admin -- create-admin you@company.com "Your Name"   (sets the password directly)
import { createHash, randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { MongoClient } from "mongodb";

const SETUP_LINK_DAYS = 7;
// Must match hashPassword in src/lib/server/security.ts.
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await promisify(scrypt)(password, salt, 64, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), hash.toString("base64")].join("$");
}

function passwordProblem(password) {
  if (password.length < 10) return "Use at least 10 characters.";
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
  return null;
}
const RESET_LINK_MINUTES = 60;

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local first.");
  process.exit(1);
}
const appUrl = process.env.APP_URL || "http://localhost:3000";
const [command, argument] = process.argv.slice(2);

function issueToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}

async function passwordLink(db, userId, purpose) {
  const { token, tokenHash } = issueToken();
  const now = new Date();
  const lifetime = purpose === "setup" ? SETUP_LINK_DAYS * 24 * 3600 * 1000 : RESET_LINK_MINUTES * 60_000;
  await db.collection("passwordTokens").insertOne({ tokenHash, userId, purpose, createdAt: now, expiresAt: new Date(now.getTime() + lifetime) });
  return `${appUrl.replace(/\/$/, "")}/set-password?token=${token}`;
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "mnc_global_connect");
  const applications = db.collection("applications");
  const users = db.collection("users");

  if (command === "list") {
    const pending = await applications.find({ status: "submitted" }).sort({ createdAt: 1 }).toArray();
    if (!pending.length) console.log("No applications awaiting review.");
    for (const app of pending) {
      console.log(`${app.reference}  ${app.createdAt.toISOString().slice(0, 10)}  ${app.membership.plan.padEnd(12)}  ${app.applicant.company} — ${app.applicant.name} <${app.applicant.email}> (${app.applicant.country}), ${app.documents.length} documents`);
    }
  } else if (command === "approve" || command === "reject") {
    const app = await applications.findOne({ reference: String(argument ?? "").toUpperCase() });
    if (!app) throw new Error(`No application found with reference ${argument}.`);
    if (app.status !== "submitted") throw new Error(`${app.reference} is already ${app.status}.`);
    const now = new Date();
    if (command === "reject") {
      await applications.updateOne({ _id: app._id }, { $set: { status: "rejected", reviewedAt: now, updatedAt: now } });
      console.log(`${app.reference} rejected.`);
    } else {
      const existing = await users.findOne({ email: app.applicant.email });
      const userId = existing?._id ?? (await users.insertOne({
        email: app.applicant.email,
        name: app.applicant.name,
        company: app.applicant.company,
        role: "member",
        status: "invited",
        applicationId: app._id,
        failedLogins: 0,
        createdAt: now,
        updatedAt: now,
      })).insertedId;
      await applications.updateOne({ _id: app._id }, { $set: { status: "approved", userId, reviewedAt: now, updatedAt: now } });
      if (existing) await users.updateOne({ _id: userId }, { $set: { applicationId: app._id, updatedAt: now } });
      const link = await passwordLink(db, userId, "setup");
      console.log(`${app.reference} approved for ${app.applicant.email}.`);
      console.log(`Send this one-time link (valid ${SETUP_LINK_DAYS} days) so they can set a password:\n${link}`);
    }
  } else if (command === "create-admin") {
    const email = String(argument ?? "").trim().toLowerCase();
    const name = process.argv.slice(4).join(" ").trim() || email.split("@")[0];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Usage: create-admin <email> <name>");
    const now = new Date();
    const existing = await users.findOne({ email });
    const userId = existing?._id ?? (await users.insertOne({
      email, name, company: "MNC Global Connect", role: "admin", status: "invited", failedLogins: 0, createdAt: now, updatedAt: now,
    })).insertedId;
    if (existing) await users.updateOne({ _id: userId }, { $set: { role: "admin", status: existing.passwordHash ? "active" : "invited", updatedAt: now } });
    // Optional: set the password straight away (read from the environment, never from the command line).
    const password = process.env.ADMIN_PASSWORD;
    if (password) {
      const problem = passwordProblem(password);
      if (problem) throw new Error(`ADMIN_PASSWORD: ${problem}`);
      await users.updateOne({ _id: userId }, {
        $set: { passwordHash: await hashPassword(password), status: "active", failedLogins: 0, updatedAt: now },
        $unset: { lockedUntil: "" },
      });
      await db.collection("sessions").deleteMany({ userId });
      console.log(`${email} is ${existing ? "now" : "created as"} an active admin with the given password.`);
      console.log(`Sign in at ${appUrl.replace(/\/$/, "")}/login`);
    } else {
      const link = await passwordLink(db, userId, existing?.passwordHash ? "reset" : "setup");
      console.log(`${email} is ${existing ? "now" : "created as"} an admin.`);
      console.log(`Open this one-time link to set the password, then sign in at ${appUrl.replace(/\/$/, "")}/login:
${link}`);
    }
  } else if (command === "unlock") {
    // Clears a lockout from failed sign-ins (works for admins who can't sign in themselves).
    const email = String(argument ?? "").trim().toLowerCase();
    const result = await users.updateOne({ email }, { $set: { failedLogins: 0, updatedAt: new Date() }, $unset: { lockedUntil: "" } });
    if (!result.matchedCount) throw new Error(`No account for ${argument}.`);
    console.log(`${email} unlocked. They can sign in again now.`);
  } else if (command === "password-link") {
    const user = await users.findOne({ email: String(argument ?? "").toLowerCase() });
    if (!user) throw new Error(`No member account for ${argument}.`);
    const purpose = user.passwordHash ? "reset" : "setup";
    console.log(`One-time ${purpose} link for ${user.email}:\n${await passwordLink(db, user._id, purpose)}`);
  } else {
    console.log("Usage: npm run admin -- list | approve <reference> | reject <reference> | password-link <email> | unlock <email> | create-admin <email> <name>");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
