import type { BusinessEvent } from "@/types/event";

export const events: BusinessEvent[] = [
  {
    id: "global-partnerships-forum",
    title: "Global Partnerships Forum",
    type: "B2B networking",
    country: "Singapore",
    city: "Singapore",
    startsAt: "2026-11-12T09:00:00+08:00",
    summary:
      "A business networking programme for companies exploring cross-border partnerships.",
    image: "/images/events/networking.jpg",
  },
  {
    id: "india-international-trade-delegation",
    title: "India International Trade Delegation",
    type: "Business Delegation",
    country: "United Kingdom",
    city: "London",
    startsAt: "2026-12-02T09:00:00+00:00",
    summary:
      "An illustrative delegation programme for exploring international trade conversations.",
    image: "/images/events/delegation.jpg",
    illustrative: true,
  },
  {
    id: "europe-buyer-seller-meet",
    title: "Europe Buyer-Seller Meet",
    type: "B2B Meeting",
    country: "Germany",
    city: "Berlin",
    startsAt: "2027-01-20T09:00:00+01:00",
    summary:
      "An illustrative meeting programme connecting international buyers and sellers.",
    image: "/images/events/buyer-seller.jpg",
    illustrative: true,
  },
  {
    id: "export-opportunities-webinar",
    title: "Export Opportunities Webinar",
    type: "Webinar",
    country: "Online",
    city: "Online",
    startsAt: "2027-02-10T10:00:00+05:30",
    summary:
      "An illustrative online session about preparing for international export conversations.",
    image: "/images/events/webinar.jpg",
    illustrative: true,
  },
];
