import { collections } from "@/lib/db/mongodb";
import { EMAIL_PATTERN, isSameOrigin, json, readJson, serverError, text } from "@/lib/server/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const body = await readJson(request);
  const email = text(body?.email, 200).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return json({ error: "Enter a valid email address." }, 422);

  try {
    const { newsletterSubscribers } = await collections();
    const now = new Date();
    // Subscribing twice is not an error; it just refreshes the record.
    await newsletterSubscribers.updateOne(
      { email },
      { $set: { updatedAt: now }, $setOnInsert: { email, source: text(body?.source, 50) || "footer", createdAt: now } },
      { upsert: true },
    );
    return json({ ok: true }, 201);
  } catch (error) {
    return serverError(error, "Newsletter subscription");
  }
}
