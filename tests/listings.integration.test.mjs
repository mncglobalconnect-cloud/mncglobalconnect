import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo, client, app, origin, db;
let output = "";
const cookies = {};

before(async () => {
  mongo = await MongoMemoryServer.create();
  client = await new MongoClient(mongo.getUri()).connect();
  db = client.db("listing_tests");
  for (const role of ["admin", "member"]) {
    const userId = new ObjectId();
    const token = randomBytes(32).toString("hex");
    await db.collection("users").insertOne({ _id: userId, email: `${role}@example.test`, name: role, company: "Test", role, status: "active", createdAt: new Date(), updatedAt: new Date() });
    await db.collection("sessions").insertOne({ userId, tokenHash: createHash("sha256").update(token).digest("hex"), createdAt: new Date(), expiresAt: new Date(Date.now() + 3600_000) });
    cookies[role] = `mnc_session=${token}`;
  }
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()));
  origin = `http://127.0.0.1:${port}`;
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, NODE_ENV: "production", MONGODB_URI: mongo.getUri(), MONGODB_DB: "listing_tests", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  app.stdout.on("data", (chunk) => { output = (output + chunk).slice(-10000); });
  app.stderr.on("data", (chunk) => { output = (output + chunk).slice(-10000); });
  for (let attempt = 0; attempt < 120; attempt++) {
    if (app.exitCode !== null) throw new Error(`Test server exited: ${output}`);
    try {
      const response = await fetch(`${origin}/api/member-locations`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch (error) {
      if (!(error instanceof TypeError) && error.name !== "TimeoutError") throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Test server did not become ready: ${output}`);
}, { timeout: 120_000 });

after(async () => {
  if (app && app.exitCode === null) {
    const exited = once(app, "exit");
    app.kill();
    await exited;
  }
  await client?.close();
  await mongo?.stop();
});

function request(path, { role = "admin", body, method = "POST", requestOrigin = origin } = {}) {
  return fetch(`${origin}${path}`, {
    method, redirect: "manual",
    headers: { "Content-Type": "application/json", Origin: requestOrigin, ...(role ? { Cookie: cookies[role] } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

async function html(path, role) {
  const response = await fetch(`${origin}${path}`, { headers: role ? { Cookie: cookies[role] } : {} });
  assert.equal(response.status, 200);
  return response.text();
}

const future = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);
const event = { title: "Integration networking event", category: "Networking", country: "Singapore", city: "Singapore", date: future, redirectUrl: "https://example.com/event-registration", published: false };
const opportunity = { title: "Integration packaging opportunity", category: "buyer-requirement", country: "India", industry: "Packaging", date: "2026-10-29", redirectUrl: "https://example.com/opportunity-details", published: false };

test("admin-only writes reject cross-origin requests and invalid input", async () => {
  const path = "/api/admin/listings/events";
  for (const role of [null, "member"]) assert.equal((await request(path, { role, body: event })).status, 403);
  assert.equal((await request(path, { body: event, requestOrigin: "https://untrusted.example" })).status, 403);
  assert.equal((await request(path, { body: { ...event, redirectUrl: "javascript:alert(1)" } })).status, 400);
  assert.equal((await request(path, { body: { ...event, date: "2027-02-29" } })).status, 400);
  assert.equal((await request("/api/admin/listings/unknown", { body: event })).status, 404);
  assert.equal(await db.collection("listings").countDocuments(), 0);
});

test("draft, publish, edit and unpublish persist for both kinds with external-only navigation", async () => {
  for (const [kind, input] of [["events", event], ["opportunities", opportunity]]) {
    const api = `/api/admin/listings/${kind}`;
    const response = await request(api, { body: input });
    assert.equal(response.status, 201);
    const { id } = await response.json();
    assert.equal((await db.collection("listings").findOne({ _id: new ObjectId(id) })).published, false);
    assert.ok(!(await html(`/${kind}`)).includes(input.title));
    const hidden = await fetch(`${origin}/${kind}/${id}`, { redirect: "manual" });
    assert.equal(hidden.status, 404);
    const adminHtml = await html(`/admin-dashboard/${kind}`, "admin");
    assert.ok(adminHtml.includes(input.title));
    assert.ok(adminHtml.includes('name="redirectUrl"'));
    assert.ok(adminHtml.includes('name="published"'));

    const published = { ...input, id, published: true };
    assert.equal((await request(api, { method: "PUT", body: published })).status, 200);
    for (const path of ["/", `/${kind}`]) {
      const page = await html(path);
      assert.ok(page.includes(input.title));
      const links = [...page.matchAll(/<a\b[^>]*>/g)].map(([anchor]) => anchor).filter((anchor) => anchor.includes(`href="${input.redirectUrl}"`));
      assert.equal(links.length, kind === "events" ? 3 : 2, `${kind}: image, title and event Explore links`);
      for (const link of links) {
        assert.match(link, /target="_blank"/);
        assert.match(link, /rel="noopener noreferrer"/);
      }
      assert.ok(!page.includes(`href="/${kind}/${id}"`));
    }
    const redirect = await fetch(`${origin}/${kind}/${id}`, { redirect: "manual" });
    assert.equal(redirect.status, 307);
    assert.equal(redirect.headers.get("location"), input.redirectUrl);

    const updated = { ...published, redirectUrl: "https://example.com/changed", image: "https://images.example.com/card.jpg", title: `${input.title} edited` };
    assert.equal((await request(api, { method: "PUT", body: updated })).status, 200);
    const changed = await html(`/${kind}`);
    assert.ok(changed.includes(updated.title));
    assert.ok(changed.includes(`href="${updated.redirectUrl}"`));
    assert.ok(changed.includes(`src="${updated.image}"`));
    assert.equal((await request(api, { method: "PUT", body: { ...updated, published: false } })).status, 200);
    assert.ok(!(await html(`/${kind}`)).includes(updated.title));
    assert.ok(!(await html("/")).includes(updated.title));
    assert.equal((await fetch(`${origin}/${kind}/${id}`, { redirect: "manual" })).status, 404);
    assert.equal((await db.collection("listings").findOne({ _id: new ObjectId(id) })).published, false);
    assert.equal((await request(api, { method: "PUT", body: { ...published, id: "invalid" } })).status, 400);
    assert.equal((await request(api, { method: "PUT", body: { ...published, id: new ObjectId().toHexString() } })).status, 404);
    const otherKind = kind === "events" ? "opportunities" : "events";
    assert.equal((await request(`/api/admin/listings/${otherKind}`, { method: "PUT", body: { ...(kind === "events" ? opportunity : event), id } })).status, 404);
  }
});

test("home shows exactly four nearest events and four newest opportunities, excluding past events", async () => {
  for (let index = 1; index <= 5; index++) {
    for (const [kind, input] of [["events", event], ["opportunities", opportunity]]) {
      const date = kind === "events" ? `2099-01-0${index}` : `2026-10-0${index}`;
      const response = await request(`/api/admin/listings/${kind}`, { body: { ...input, title: `Ordering ${kind} ${index}`, date, published: true } });
      assert.equal(response.status, 201);
    }
  }
  assert.equal((await request("/api/admin/listings/events", { body: { ...event, title: "Past event hidden", date: "2020-01-01", published: true } })).status, 201);
  const home = await html("/");
  const cards = home.match(/<article class="market-card\b/g);
  assert.equal(cards.length, 8);
  assert.ok(!home.includes("Ordering events 5"));
  assert.ok(!home.includes("Ordering opportunities 1"));
  assert.ok(home.indexOf("Ordering events 1") < home.indexOf("Ordering events 2"));
  assert.ok(home.indexOf("Ordering opportunities 5") < home.indexOf("Ordering opportunities 4"));
  assert.ok(!home.includes("Past event hidden"));
  const eventsPage = await html("/events");
  assert.ok(eventsPage.includes("Ordering events 5"));
  assert.ok(!eventsPage.includes("Past event hidden"));
  assert.ok((await html("/opportunities")).includes("Ordering opportunities 1"));
});
