import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Business Resources" };

export default function ResourcesPage() {
  return (
    <RoutePlaceholder
      title="Resources for Global Business"
      description="Explore practical business guides, country insights, trade resources and preparation tools for international growth."
    />
  );
}
