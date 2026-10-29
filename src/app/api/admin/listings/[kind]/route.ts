import { collections } from "@/lib/db/mongodb";
import { isListingKind, validateListing } from "@/lib/listings";
import { getAdmin, toObjectId } from "@/lib/server/admin";
import { isSameOrigin, json, readJson, serverError } from "@/lib/server/http";

type Context = { params: Promise<{ kind: string }> };

async function save(request: Request, ctx: Context, editing: boolean) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  try {
    if (!(await getAdmin())) return json({ error: "Admin access required." }, 403);
    const { kind } = await ctx.params;
    if (!isListingKind(kind)) return json({ error: "Unknown listing type." }, 404);
    const body = await readJson(request);
    const result = validateListing(body, kind);
    if (!result.value) return json({ error: result.error }, 400);
    const { listings } = await collections();
    const now = new Date();
    if (editing) {
      const id = typeof body?.id === "string" ? toObjectId(body.id) : null;
      if (!id) return json({ error: "Invalid listing ID." }, 400);
      const updated = await listings.updateOne({ _id: id, kind }, { $set: { ...result.value, updatedAt: now } });
      return updated.matchedCount ? json({ ok: true, id: id.toHexString() }) : json({ error: "Listing not found." }, 404);
    }
    const inserted = await listings.insertOne({ ...result.value, createdAt: now, updatedAt: now });
    return json({ ok: true, id: inserted.insertedId.toHexString() }, 201);
  } catch (error) {
    return serverError(error, "Saving listing");
  }
}

export async function POST(request: Request, ctx: Context) {
  return save(request, ctx, false);
}

export async function PUT(request: Request, ctx: Context) {
  return save(request, ctx, true);
}
