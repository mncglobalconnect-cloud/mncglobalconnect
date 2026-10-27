import { contactTopics } from "@/data/contact";
import { membershipCountries } from "@/data/membership";
import { collections } from "@/lib/db/mongodb";
import { EMAIL_PATTERN, isSameOrigin, json, readJson, serverError, text } from "@/lib/server/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const body = await readJson(request);
  if (!body) return json({ error: "Invalid request." }, 400);

  const enquiry = {
    name: text(body.name, 120),
    email: text(body.email, 200).toLowerCase(),
    company: text(body.company, 200) || undefined,
    country: text(body.country, 100),
    topic: text(body.topic, 100),
    message: text(body.message, 1500),
  };
  const errors: Record<string, string> = {};
  if (enquiry.name.length < 2) errors.name = "Enter your full name.";
  if (!EMAIL_PATTERN.test(enquiry.email)) errors.email = "Enter a valid email address.";
  if (!membershipCountries.includes(enquiry.country)) errors.country = "Select your country.";
  if (!(contactTopics as readonly string[]).includes(enquiry.topic)) errors.topic = "Choose what your enquiry is about.";
  if (enquiry.message.length < 20) errors.message = "Tell us a little more (at least 20 characters).";
  if (body.consent !== true) errors.consent = "Please confirm we may contact you about this enquiry.";
  if (Object.keys(errors).length) return json({ error: "Some details need attention.", errors }, 422);

  try {
    const { contactEnquiries } = await collections();
    await contactEnquiries.insertOne({ ...enquiry, status: "new", createdAt: new Date() });
    return json({ ok: true }, 201);
  } catch (error) {
    return serverError(error, "Contact enquiry");
  }
}
