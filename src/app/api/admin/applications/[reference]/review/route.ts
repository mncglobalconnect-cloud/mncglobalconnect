import { approveApplication, getAdmin, rejectApplication } from "@/lib/server/admin";
import { isSameOrigin, json, readJson, serverError } from "@/lib/server/http";

/** Approve or reject a submitted application. Approval returns the member's set-password link. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/applications/[reference]/review">) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  try {
    if (!(await getAdmin())) return json({ error: "Admin access required." }, 403);
    const { reference } = await ctx.params;
    const body = await readJson(request);
    if (body?.decision === "approve") {
      const result = await approveApplication(reference.toUpperCase(), new URL(request.url).origin);
      return "error" in result ? json({ error: result.error }, result.status) : json(result);
    }
    if (body?.decision === "reject") {
      const result = await rejectApplication(reference.toUpperCase());
      return "error" in result ? json({ error: result.error }, result.status) : json(result);
    }
    return json({ error: "Choose approve or reject." }, 400);
  } catch (error) {
    return serverError(error, "Application review");
  }
}
