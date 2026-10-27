import { collections } from "@/lib/db/mongodb";
import { getAdmin, toObjectId } from "@/lib/server/admin";
import { isSameOrigin, json, readJson, serverError } from "@/lib/server/http";

/** Marks a contact enquiry as handled or new. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/enquiries/[id]">) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  try {
    if (!(await getAdmin())) return json({ error: "Admin access required." }, 403);
    const id = toObjectId((await ctx.params).id);
    const status = (await readJson(request))?.status;
    if (!id || (status !== "new" && status !== "handled")) return json({ error: "Invalid request." }, 400);
    const { contactEnquiries } = await collections();
    const result = await contactEnquiries.updateOne({ _id: id }, { $set: { status } });
    return result.matchedCount ? json({ ok: true }) : json({ error: "Enquiry not found." }, 404);
  } catch (error) {
    return serverError(error, "Enquiry update");
  }
}
