import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function DelegationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      title={`Business Delegation ${id}`}
      description="Delegation programme, eligibility and application details will be available here."
    />
  );
}
