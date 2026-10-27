import { collections } from "@/lib/db/mongodb";
import { isSameOrigin, json, readJson, serverError, text } from "@/lib/server/http";
import { hashPassword, hashToken, passwordProblem } from "@/lib/server/security";
import { createSession } from "@/lib/server/session";

/** Sets a password from a one-time set-up or reset link, activates the account and signs the member in. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const body = await readJson(request);
  const token = text(body?.token, 200);
  const password = typeof body?.password === "string" ? body.password : "";
  const problem = passwordProblem(password);
  if (!token) return json({ error: "This link is invalid." }, 400);
  if (problem) return json({ error: problem, field: "password" }, 422);

  try {
    const { passwordTokens, users, sessions } = await collections();
    const now = new Date();
    // Claim the token atomically so a link cannot be used twice.
    const claimed = await passwordTokens.findOneAndUpdate(
      { tokenHash: hashToken(token), usedAt: { $exists: false }, expiresAt: { $gt: now } },
      { $set: { usedAt: now } },
    );
    if (!claimed) return json({ error: "This link has expired or was already used. Ask us for a new one." }, 410);

    const user = await users.findOne({ _id: claimed.userId });
    if (!user || user.status === "disabled") return json({ error: "This account is not active. Please contact us." }, 403);

    await users.updateOne({ _id: user._id }, {
      $set: { passwordHash: await hashPassword(password), status: "active", failedLogins: 0, updatedAt: now },
      $unset: { lockedUntil: "" },
    });
    // A new password signs out every other session.
    await sessions.deleteMany({ userId: user._id });
    await createSession(user._id, false, request.headers.get("user-agent") ?? undefined);
    return json({ ok: true, redirect: "/dashboard" });
  } catch (error) {
    return serverError(error, "Set password");
  }
}
