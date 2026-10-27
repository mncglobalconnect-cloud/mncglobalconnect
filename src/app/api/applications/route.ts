import { randomBytes } from "node:crypto";
import type { ObjectId } from "mongodb";
import { MongoServerError } from "mongodb";
import { validateStep } from "@/components/membership/application-validation";
import { applicationSteps } from "@/data/membership";
import { collections, documentBucket } from "@/lib/db/mongodb";
import type { StoredDocument } from "@/lib/db/models";
import { DOCUMENT_TYPES, MAX_DOCUMENT_SIZE, parseDraft } from "@/lib/membership-application";
import { isSameOrigin, json, serverError } from "@/lib/server/http";

const MAX_DOCUMENTS = 8;

/** Checks the file's leading bytes, not just the type the browser reported. */
function matchesSignature(bytes: Uint8Array, type: string) {
  if (type === "application/pdf") return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return false;
}

function newReference() {
  return `MNC-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "The application could not be read. Please try again." }, 400);
  }

  // Shape-check the payload with the same parser used for saved drafts.
  let application;
  try {
    application = parseDraft(JSON.stringify({ version: 1, step: 7, application: JSON.parse(String(form.get("application") ?? "")) })).application;
  } catch {
    return json({ error: "The application data is incomplete. Please review the form and try again." }, 400);
  }

  for (let step = 0; step < applicationSteps.length; step++) {
    const errors = validateStep(application, step);
    if (Object.keys(errors).length) return json({ error: "Some details need attention.", step, errors }, 422);
  }

  const files: { kind: string; file: File; bytes: Uint8Array }[] = [];
  if (application.documents.length > MAX_DOCUMENTS) return json({ error: "Too many documents attached." }, 400);
  for (const doc of application.documents) {
    const file = form.get(`document:${doc.kind}`);
    if (!(file instanceof File)) return json({ error: `Please re-attach "${doc.kind}".`, step: 6 }, 422);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!DOCUMENT_TYPES.includes(file.type) || bytes.length === 0 || bytes.length > MAX_DOCUMENT_SIZE || !matchesSignature(bytes, file.type)) {
      return json({ error: `"${doc.kind}" must be a PDF, JPG or PNG up to 5 MB.`, step: 6 }, 422);
    }
    files.push({ kind: doc.kind, file, bytes });
  }

  const uploaded: ObjectId[] = [];
  try {
    const { applications } = await collections();
    const email = application.personal.email.trim().toLowerCase();
    if (await applications.findOne({ "applicant.email": email, status: "submitted" }, { projection: { _id: 1 } })) {
      return json({ error: "An application with this email is already under review. Contact us if you need to update it." }, 409);
    }

    const bucket = await documentBucket();
    const documents: StoredDocument[] = [];
    for (const { kind, file, bytes } of files) {
      const stream = bucket.openUploadStream(file.name.slice(0, 200), { metadata: { kind, contentType: file.type, applicantEmail: email } });
      uploaded.push(stream.id);
      await new Promise<void>((resolve, reject) => {
        stream.once("finish", () => resolve());
        stream.once("error", reject);
        stream.end(Buffer.from(bytes));
      });
      documents.push({ kind, fileId: stream.id, name: file.name.slice(0, 200), size: bytes.length, type: file.type });
    }

    const { documents: _documents, consent, membership, ...details } = application;
    void _documents;
    const now = new Date();
    for (let attempt = 0; ; attempt++) {
      const reference = newReference();
      try {
        await applications.insertOne({
          reference,
          status: "submitted",
          applicant: {
            name: application.personal.fullName.trim(),
            email,
            company: application.business.company.trim(),
            country: application.address.country,
          },
          membership,
          details: { ...details, personal: { ...details.personal, email } },
          consent: { ...consent, acceptedAt: now },
          documents,
          createdAt: now,
          updatedAt: now,
        });
        return json({ reference, createdAt: now.toISOString(), membership }, 201);
      } catch (error) {
        // Retry on the rare reference collision only.
        if (!(error instanceof MongoServerError && error.code === 11000 && attempt < 4)) throw error;
      }
    }
  } catch (error) {
    if (uploaded.length) {
      const bucket = await documentBucket().catch(() => null);
      await Promise.all(uploaded.map((id) => bucket?.delete(id).catch(() => undefined)));
    }
    return serverError(error, "Membership application");
  }
}
