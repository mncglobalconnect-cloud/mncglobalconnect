import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/mongodb";
import type { UserRecord } from "@/lib/db/models";
import { createToken } from "./security";
import { getCurrentUser } from "./session";

export const SETUP_LINK_DAYS = 7;
const RESET_LINK_MINUTES = 60;

/** The signed-in admin, or null for visitors and members. */
export async function getAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

export function toObjectId(value: string) {
  return ObjectId.isValid(value) && /^[a-f\d]{24}$/i.test(value) ? new ObjectId(value) : null;
}

/** One-time set-up (new account) or reset link for a member. */
export async function issuePasswordLink(user: Pick<UserRecord, "_id" | "passwordHash">, origin: string) {
  const { passwordTokens } = await collections();
  const purpose = user.passwordHash ? "reset" : "setup";
  const { token, tokenHash } = createToken();
  const now = new Date();
  const lifetime = purpose === "setup" ? SETUP_LINK_DAYS * 24 * 3600 * 1000 : RESET_LINK_MINUTES * 60_000;
  await passwordTokens.insertOne({ tokenHash, userId: user._id!, purpose, createdAt: now, expiresAt: new Date(now.getTime() + lifetime) });
  return { link: new URL(`/set-password?token=${token}`, origin).toString(), purpose, expiresIn: purpose === "setup" ? `${SETUP_LINK_DAYS} days` : `${RESET_LINK_MINUTES} minutes` };
}

/** Approves a submitted application, creating (or linking) the member account. */
export async function approveApplication(reference: string, origin: string) {
  const { applications, users } = await collections();
  const application = await applications.findOne({ reference });
  if (!application) return { error: "Application not found.", status: 404 } as const;
  if (application.status !== "submitted") return { error: `This application is already ${application.status}.`, status: 409 } as const;

  const now = new Date();
  let user = await users.findOne({ email: application.applicant.email });
  if (!user) {
    const record: UserRecord = {
      email: application.applicant.email,
      name: application.applicant.name,
      company: application.applicant.company,
      role: "member",
      status: "invited",
      applicationId: application._id,
      failedLogins: 0,
      createdAt: now,
      updatedAt: now,
    };
    user = { ...record, _id: (await users.insertOne(record)).insertedId };
  } else {
    await users.updateOne({ _id: user._id }, { $set: { applicationId: application._id, updatedAt: now } });
  }
  // Only flip a still-submitted application, so two admins cannot approve it twice.
  const updated = await applications.updateOne(
    { _id: application._id, status: "submitted" },
    { $set: { status: "approved", userId: user._id, reviewedAt: now, updatedAt: now } },
  );
  if (!updated.modifiedCount) return { error: "This application was just reviewed by someone else.", status: 409 } as const;
  return { link: await issuePasswordLink(user, origin), email: user.email } as const;
}

export async function rejectApplication(reference: string) {
  const { applications } = await collections();
  const now = new Date();
  const result = await applications.updateOne({ reference, status: "submitted" }, { $set: { status: "rejected", reviewedAt: now, updatedAt: now } });
  return result.modifiedCount ? { ok: true } as const : { error: "Only submitted applications can be rejected.", status: 409 } as const;
}
