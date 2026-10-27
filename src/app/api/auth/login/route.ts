import { collections } from "@/lib/db/mongodb";
import { EMAIL_PATTERN, isSameOrigin, json, readJson, serverError, text } from "@/lib/server/http";
import { hashPassword, verifyPassword } from "@/lib/server/security";
import { createSession } from "@/lib/server/session";

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const INVALID = "That email and password combination is not recognised.";

// Compared against when the email is unknown, so response time does not reveal which emails exist.
let decoyHash: Promise<string> | null = null;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const body = await readJson(request);
  const email = text(body?.email, 200).toLowerCase();
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  if (!EMAIL_PATTERN.test(email) || !password) return json({ error: "Enter your email and password." }, 422);

  try {
    const { users } = await collections();
    const user = await users.findOne({ email });
    const now = new Date();

    if (!user?.passwordHash) {
      await verifyPassword(password, await (decoyHash ??= hashPassword("decoy-password-1")));
      return json({ error: INVALID }, 401);
    }
    if (user.lockedUntil && user.lockedUntil > now) {
      return json({ error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes or reset your password.` }, 429);
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      const failedLogins = (user.failedLogins ?? 0) + 1;
      const lock = failedLogins >= MAX_FAILED_LOGINS;
      await users.updateOne({ _id: user._id }, {
        $set: { failedLogins: lock ? 0 : failedLogins, updatedAt: now, ...(lock ? { lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60_000) } : {}) },
      });
      return json({ error: lock ? `Too many attempts. Try again in ${LOCK_MINUTES} minutes or reset your password.` : INVALID }, lock ? 429 : 401);
    }
    if (user.status !== "active") return json({ error: "This account is not active. Please contact us." }, 403);

    await users.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lastLoginAt: now, updatedAt: now }, $unset: { lockedUntil: "" } });
    await createSession(user._id, body?.remember === true, request.headers.get("user-agent") ?? undefined);
    return json({ ok: true, redirect: user.role === "admin" ? "/admin-dashboard" : "/dashboard" });
  } catch (error) {
    return serverError(error, "Login");
  }
}
