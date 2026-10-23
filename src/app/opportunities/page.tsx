import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Global Business Opportunities" };

export default function OpportunitiesPage() {
  return (
    <RoutePlaceholder
      title="Explore Global Business Opportunities"
      description="Discover buyer requirements, trade leads, seller opportunities, joint ventures and international partnerships."
    />
  );
}
