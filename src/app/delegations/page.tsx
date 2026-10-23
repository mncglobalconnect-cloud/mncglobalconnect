import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "International Business Delegations" };

export default function DelegationsPage() {
  return (
    <RoutePlaceholder
      title="Explore Markets Through Business Delegations"
      description="Build market understanding through international business meetings, partner introductions and focused market visits."
    />
  );
}
