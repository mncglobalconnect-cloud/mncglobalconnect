import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "B2B Meetings" };

export default function B2BMeetingsPage() {
  return (
    <RoutePlaceholder
      title="Structured B2B Meetings That Move Business Forward"
      description="Qualified business requirements, relevant introductions and focused conversations across international markets."
    />
  );
}
