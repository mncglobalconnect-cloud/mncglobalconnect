import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Buyer-Seller Meetings" };

export default function BuyerSellerPage() {
  return (
    <RoutePlaceholder
      title="Connect Buyers With Relevant Sellers"
      description="A structured buyer-seller workflow connecting requirements, supplier capabilities and business meetings."
    />
  );
}
