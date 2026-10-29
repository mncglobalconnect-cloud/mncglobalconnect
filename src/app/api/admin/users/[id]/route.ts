import { collections } from "@/lib/db/mongodb";
import { getAdmin, issuePasswordLink, toObjectId } from "@/lib/server/admin";
import { isSameOrigin, json, readJson, serverError } from "@/lib/server/http";

/** Member account actions: disable, enable, or issue a set-up / reset link. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  try {
    const admin = await getAdmin();
    if (!admin) return json({ error: "Admin access required." }, 403);
    const id = toObjectId((await ctx.params).id);
    if (!id) return json({ error: "Member not found." }, 404);
    const { users, sessions } = await collections();
    const user = await users.findOne({ _id: id });
    if (!user) return json({ error: "Member not found." }, 404);
    const action = (await readJson(request))?.action;
    const now = new Date();

    if (action === "disable") {
      if (user._id.equals(admin._id)) return json({ error: "You can't disable your own account." }, 400);
      await users.updateOne({ _id: id }, { $set: { status: "disabled", updatedAt: now } });
      await sessions.deleteMany({ userId: id });
      return json({ ok: true });
    }
    if (action === "unlock") {
      // Clears a temporary lockout from failed sign-ins without changing the password.
      await users.updateOne({ _id: id }, { $set: { failedLogins: 0, updatedAt: now }, $unset: { lockedUntil: "" } });
      return json({ ok: true });
    }
    if (action === "enable") {
      await users.updateOne({ _id: id }, { $set: { status: user.passwordHash ? "active" : "invited", updatedAt: now }, $unset: { lockedUntil: "" } });
      return json({ ok: true });
    }
    if (action === "password-link") {
      if (user.status === "disabled") return json({ error: "Enable the account first." }, 400);
      return json(await issuePasswordLink(user, new URL(request.url).origin));
    }
    return json({ error: "Unknown action." }, 400);
  } catch (error) {
    return serverError(error, "Member update");
  }
}
