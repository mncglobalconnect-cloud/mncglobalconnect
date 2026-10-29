import type { Metadata } from "next";
import { ListingsPage } from "@/components/listings/listings-page";

export const metadata: Metadata = { title: "Global Business Opportunities" };

export default function OpportunitiesPage() {
  return <ListingsPage kind="opportunities" />;
}
