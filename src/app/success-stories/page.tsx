import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Business Success Stories" };

export default function SuccessStoriesPage() {
  return (
    <RoutePlaceholder
      title="Connections That Create New Possibilities"
      description="Explore how business introductions and international conversations can help organisations identify opportunities for growth."
    />
  );
}
