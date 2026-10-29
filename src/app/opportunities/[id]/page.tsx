import { redirectToListing } from "@/lib/server/listings";

export default async function OpportunityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return redirectToListing("opportunities", id);
}
