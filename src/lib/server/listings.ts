import "server-only";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { collections } from "@/lib/db/mongodb";
import type { ListingRecord } from "@/lib/db/models";
import type { Listing, ListingKind } from "@/types/listing";
import type { WithId } from "mongodb";
import { toObjectId } from "@/lib/server/admin";

export function serializeListing(record: WithId<ListingRecord>): Listing {
  const { _id, kind, title, category, country, countryCode, city, industry, date, summary, image, redirectUrl, published } = record;
  return { id: _id.toHexString(), kind, title, category, country, countryCode, city, industry, date, summary, image, redirectUrl, published };
}

export async function getPublicListings(kind: ListingKind, limit?: number): Promise<{ items: Listing[]; error?: string }> {
  await connection();
  try {
    const { listings } = await collections();
    const query = listings.find({
      kind,
      published: true,
      ...(kind === "events" ? { date: { $gte: new Date().toISOString().slice(0, 10) } } : {}),
    }).sort({ date: kind === "events" ? 1 : -1, _id: -1 });
    if (limit) query.limit(limit);
    return { items: (await query.toArray()).map(serializeListing) };
  } catch (error) {
    console.error(`Loading public ${kind} failed:`, error);
    return { items: [], error: `We couldn't load ${kind} right now. Please try again later.` };
  }

}

export async function redirectToListing(kind: ListingKind, id: string) {
  await connection();
  const objectId = toObjectId(id);
  if (!objectId) notFound();
  const { listings } = await collections();
  const listing = await listings.findOne({ _id: objectId, kind, published: true });
  if (!listing) notFound();
  redirect(listing.redirectUrl);
}
