// Verifies the MongoDB setup the site uses: connection, permissions and a real write.
//   npm run db:check
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "mnc_global_connect";
const ok = (message) => console.log(`  ✓ ${message}`);
const fail = (message) => { console.log(`  ✗ ${message}`); process.exitCode = 1; };

console.log(`MongoDB check for database "${dbName}"\n`);
if (!uri) {
  fail("MONGODB_URI is not set. Add it to .env.local (or .env).");
  process.exit(1);
}
const masked = uri.replace(/\/\/([^:@/]+):[^@]+@/, "//$1:****@");
ok(`MONGODB_URI found (${masked})`);

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  ok("Connected to the server");

  const { authInfo } = await client.db("admin").command({ connectionStatus: 1, showPrivileges: true });
  const user = authInfo.authenticatedUsers[0];
  if (user) ok(`Signed in as "${user.user}" (auth database "${user.db}")`);
  const roles = authInfo.authenticatedUserRoles.map((r) => `${r.role}@${r.db}`).join(", ") || "none";
  console.log(`    roles: ${roles}`);
  const canWrite = authInfo.authenticatedUserRoles.some((r) =>
    (r.db === dbName && ["readWrite", "dbOwner", "dbAdmin"].includes(r.role))
    || (r.db === "admin" && ["readWriteAnyDatabase", "root", "dbOwner"].includes(r.role)));
  if (!canWrite) {
    fail(`This user has no write role on "${dbName}".`);
    console.log(`\n  Fix one of:\n  • Grant access (run as a MongoDB admin, in the "${user?.db ?? "auth"}" database):\n      db.grantRolesToUser("${user?.user ?? "<user>"}", [{ role: "readWrite", db: "${dbName}" }])`);
    console.log(`  • Or set MONGODB_DB to a database this user can write to.`);
  }

  const probe = client.db(dbName).collection("_setupCheck");
  const { insertedId } = await probe.insertOne({ checkedAt: new Date() });
  await probe.deleteOne({ _id: insertedId });
  await probe.drop().catch(() => undefined);
  ok(`Write and delete test passed in "${dbName}"`);

  const collections = (await client.db(dbName).listCollections().toArray()).map((c) => c.name).sort();
  console.log(`    collections: ${collections.length ? collections.join(", ") : "(none yet; created on first use)"}`);
  console.log("\nReady: the site will store all data in this database.");
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
  if (/not authorized/i.test(String(error?.message))) console.log(`\n  The user cannot write to "${dbName}". See the fix above.`);
} finally {
  await client.close();
}
