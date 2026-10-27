import { isSameOrigin, json, serverError } from "@/lib/server/http";
import { endSession } from "@/lib/server/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  try {
    await endSession();
    return json({ ok: true });
  } catch (error) {
    return serverError(error, "Logout");
  }
}
