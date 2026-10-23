import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Trade Opportunities" };

export default function TradeOpportunitiesPage() {
  return (
    <RoutePlaceholder
      title="International Trade Opportunities"
      description="Explore import, export and cross-border trade opportunities with relevant business connections."
    />
  );
}
