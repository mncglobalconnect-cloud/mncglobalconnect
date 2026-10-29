import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-ui";
import { ListingsManager } from "@/components/admin/listings-manager";
import { collections } from "@/lib/db/mongodb";
import { isListingKind } from "@/lib/listings";
import { getAdmin } from "@/lib/server/admin";
import { serializeListing } from "@/lib/server/listings";

export default async function AdminListingsPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isListingKind(kind) || !(await getAdmin())) notFound();
  const { listings } = await collections();
  const items = (await listings.find({ kind }).sort({ updatedAt: -1, _id: -1 }).toArray()).map(serializeListing);
  return (
    <>
      <PageHeader title={kind === "events" ? "Events" : "Opportunities"} description="Manage listings and publish links to external websites. Drafts stay hidden from visitors." />
      <ListingsManager kind={kind} items={items} />
    </>
  );
}
