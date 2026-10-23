import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <RoutePlaceholder
      title="About MNC Global Connect"
      description="A managed business facilitation and market-access layer helping organisations turn relevant connections into global growth."
    />
  );
}
