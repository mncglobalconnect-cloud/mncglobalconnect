import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function OpportunityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      title={`Opportunity ${id}`}
      description="Opportunity details and business introduction requests will be available here."
    />
  );
}
