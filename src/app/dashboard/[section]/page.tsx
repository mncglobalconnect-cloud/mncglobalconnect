import { RoutePlaceholder } from "@/components/layout/route-placeholder";

const sectionLabels: Record<string, string> = {
  meetings: "B2B Meetings",
  opportunities: "Opportunities",
  events: "Events",
  delegations: "Delegations",
  introductions: "Introductions",
  profile: "Business Profile",
};

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title =
    sectionLabels[section] ??
    section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <RoutePlaceholder
      title={title}
      description="This part of your shared MNC business profile is being prepared for the connected member experience."
    />
  );
}
