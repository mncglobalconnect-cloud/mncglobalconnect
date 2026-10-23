import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Global Business Network" };

export default function NetworkPage() {
  return (
    <RoutePlaceholder
      title="Business Connections Without Borders"
      description="Discover business communities, industry connections and international relationships across global markets."
    />
  );
}
