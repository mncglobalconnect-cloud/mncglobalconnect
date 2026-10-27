import { Readable } from "node:stream";
import { collections, documentBucket } from "@/lib/db/mongodb";
import { getAdmin, toObjectId } from "@/lib/server/admin";
import { json, serverError } from "@/lib/server/http";

/** Streams an uploaded verification document to an admin. */
export async function GET(request: Request, ctx: RouteContext<"/api/admin/documents/[id]">) {
  try {
    if (!(await getAdmin())) return json({ error: "Admin access required." }, 403);
    const id = toObjectId((await ctx.params).id);
    if (!id) return json({ error: "Document not found." }, 404);
    // Only serve files referenced by an application.
    const { applications } = await collections();
    const owner = await applications.findOne({ "documents.fileId": id }, { projection: { documents: 1 } });
    const doc = owner?.documents.find((item) => item.fileId.equals(id));
    if (!doc) return json({ error: "Document not found." }, 404);

    const stream = (await documentBucket()).openDownloadStream(id);
    const download = new URL(request.url).searchParams.has("download");
    const filename = doc.name.replace(/[^\w.\- ]+/g, "_");
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": doc.type,
        "Content-Length": String(doc.size),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serverError(error, "Document download");
  }
}
