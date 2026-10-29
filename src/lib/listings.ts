import { countryCodes } from "../data/country-codes";
import type { ListingInput, ListingKind } from "@/types/listing";

export const opportunityLabels: Record<string, string> = {
  "buyer-requirement": "Buyer requirement",
  "seller-opportunity": "Supplier opportunity",
  "trade-lead": "Export opportunity",
  "joint-venture": "Joint venture",
  "distribution-partner": "Distribution partner",
  "technology-partnership": "Technology partnership",
};

export function isListingKind(value: string): value is ListingKind {
  return value === "events" || value === "opportunities";
}

export function isWebsiteUrl(value: string) {
  if (!/^https?:\/\//i.test(value) || /[\s\\\u0000-\u001f\u007f]/.test(value) || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validateListing(body: Record<string, unknown> | null, kind: ListingKind):
  { value: ListingInput; error?: never } | { error: string; value?: never } {
  if (!body) return { error: "Enter the listing details." };
  const fields = { title: 180, category: 80, country: 100, city: 100, industry: 100, date: 10, summary: 1000, image: 2048, redirectUrl: 2048 };
  const values: Record<string, string> = {};
  for (const [field, max] of Object.entries(fields)) {
    const raw = body[field];
    if (raw !== undefined && typeof raw !== "string") return { error: `Invalid ${field}.` };
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value.length > max) return { error: `${field} must be ${max} characters or fewer.` };
    values[field] = value;
  }
  const { title, category, country, city, industry, date, summary, image, redirectUrl } = values;
  if (!title || !category) return { error: "Title and category are required." };
  if (!Object.hasOwn(countryCodes, country) && !(kind === "events" && country === "Online")) {
    return { error: "Select a valid country, or Online for a virtual event." };
  }
  if (kind === "opportunities" && (!Object.hasOwn(opportunityLabels, category) || !industry)) {
    return { error: "Select an opportunity category and enter the industry." };
  }
  if (kind === "events" && !city) return { error: "Enter the event city, or Online." };
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return { error: "Enter a valid date." };
  }
  if (!isWebsiteUrl(redirectUrl)) return { error: "Enter a complete website link starting with https:// or http://, without credentials or spaces." };
  const localImage = /^\/images\/[\w/-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(image);
  if (image && !localImage && !isWebsiteUrl(image)) return { error: "Use an HTTP(S) image URL or a local /images/ image path." };
  if (typeof body.published !== "boolean") return { error: "Choose draft or published status." };
  return {
    value: {
      kind, title, category, country, countryCode: country === "Online" ? "" : countryCodes[country],
      city: kind === "events" ? city : "", industry: kind === "opportunities" ? industry : "",
      date, summary, redirectUrl, published: body.published,
      image: image || (kind === "events" ? "/images/events/networking.jpg" : "/images/opportunities/packaging.jpg"),
    },
  };
}
