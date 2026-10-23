import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Global Business Events" };

export default function EventsPage() {
  return (
    <RoutePlaceholder
      title="Global Business Events & Networking"
      description="Meet international partners through business networking, B2B programmes, trade missions and events."
    />
  );
}
