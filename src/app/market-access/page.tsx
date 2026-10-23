import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Global Market Access" };

export default function MarketAccessPage() {
  return (
    <RoutePlaceholder
      title="Enter New Markets With the Right Connections"
      description="Explore market discovery, partner identification, buyer connections, B2B matchmaking and market-entry support."
    />
  );
}
