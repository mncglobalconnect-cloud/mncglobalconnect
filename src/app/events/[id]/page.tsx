import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      title={`Business Event ${id}`}
      description="Event programme details and registration information will be available here."
    />
  );
}
