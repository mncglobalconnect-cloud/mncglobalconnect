import type { Metadata } from "next";
import { ListingsPage } from "@/components/listings/listings-page";

export const metadata: Metadata = { title: "Global Business Events" };

export default function EventsPage() {
  return <ListingsPage kind="events" />;
}
