import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "International Introductions" };

export default function InternationalIntroductionsPage() {
  return (
    <RoutePlaceholder
      title="International Business Introductions"
      description="Facilitated, consent-based introductions for buyers, suppliers, distributors, technology partners and joint-venture partners."
    />
  );
}
