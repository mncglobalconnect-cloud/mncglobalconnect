import { collections } from "@/lib/db/mongodb";
import { EMAIL_PATTERN, isSameOrigin, json, readJson, serverError, text } from "@/lib/server/http";
import { createToken } from "@/lib/server/security";

const RESET_MINUTES = 60;

/**
 * Creates a one-time reset link for an active member. No email service is connected yet, so the link is
 * logged on the server in development only. The response is the same whether or not the email exists.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const body = await readJson(request);
  const email = text(body?.email, 200).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return json({ error: "Enter a valid email address." }, 422);

  try {
    const { users, passwordTokens } = await collections();
    const user = await users.findOne({ email, status: "active" }, { projection: { _id: 1 } });
    if (user) {
      const { token, tokenHash } = createToken();
      const now = new Date();
      await passwordTokens.insertOne({
        tokenHash, userId: user._id, purpose: "reset", createdAt: now, expiresAt: new Date(now.getTime() + RESET_MINUTES * 60_000),
      });
      if (process.env.NODE_ENV !== "production") {
        console.info(`[dev] Password reset link for ${email}: ${new URL(`/set-password?token=${token}`, request.url)}`);
      }
    }
    return json({ ok: true });
  } catch (error) {
    return serverError(error, "Password reset request");
  }
}
