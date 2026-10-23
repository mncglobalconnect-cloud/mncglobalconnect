import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Contact MNC Global Connect" };

export default function ContactPage() {
  return (
    <RoutePlaceholder
      title="Start a Global Business Conversation"
      description="Contact our team about business introductions, B2B meetings, buyer-seller support, delegations, events or market access."
    />
  );
}
