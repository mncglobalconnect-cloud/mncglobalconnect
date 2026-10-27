import "server-only";
import type { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { cache } from "react";
import { collections } from "@/lib/db/mongodb";
import { createToken, hashToken } from "./security";

export const SESSION_COOKIE = "mnc_session";
const SESSION_DAYS = 30;
const SHORT_SESSION_HOURS = 12;

export async function createSession(userId: ObjectId, remember: boolean, userAgent?: string) {
  const { sessions } = await collections();
  const { token, tokenHash } = createToken();
  const now = new Date();
  const lifetime = remember ? SESSION_DAYS * 24 * 3600 * 1000 : SHORT_SESSION_HOURS * 3600 * 1000;
  const expiresAt = new Date(now.getTime() + lifetime);
  await sessions.insertOne({ tokenHash, userId, createdAt: now, expiresAt, userAgent: userAgent?.slice(0, 300) });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Without "keep me signed in" the cookie ends with the browser session.
    ...(remember ? { expires: expiresAt } : {}),
  });
}

export async function endSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const { sessions } = await collections();
    await sessions.deleteOne({ tokenHash: hashToken(token) });
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** The signed-in, active user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { sessions, users } = await collections();
  const session = await sessions.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await users.findOne({ _id: session.userId, status: "active" }, { projection: { passwordHash: 0 } });
  return user;
});
