import type { BusinessOpportunity } from "@/types/opportunity";

export const opportunities: BusinessOpportunity[] = [
  {
    id: "sustainable-packaging-middle-east",
    title: "Sustainable packaging supplier for Middle East distribution",
    type: "buyer-requirement",
    countryCode: "AE",
    country: "United Arab Emirates",
    industry: "Packaging",
    summary:
      "A regional distributor is exploring introductions to experienced sustainable packaging manufacturers.",
    postedAt: "2026-09-18",
    image: "/images/opportunities/packaging.jpg",
  },
  {
    id: "textile-garments-buyer-germany",
    title: "Textile garments buyer",
    type: "buyer-requirement",
    countryCode: "DE",
    country: "Germany",
    industry: "Textiles & Apparel",
    summary:
      "An illustrative buyer requirement for apparel suppliers interested in European market conversations.",
    postedAt: "2026-10-08",
    image: "/images/opportunities/textile-production.jpg",
    illustrative: true,
  },
  {
    id: "manufacturing-partnership-usa",
    title: "Manufacturing partnership opportunity",
    type: "joint-venture",
    countryCode: "US",
    country: "United States",
    industry: "Manufacturing",
    summary:
      "An illustrative partnership opportunity for manufacturers exploring cross-border collaboration.",
    postedAt: "2026-10-05",
    image: "/images/opportunities/manufacturing-floor.jpg",
    illustrative: true,
  },
  {
    id: "construction-materials-saudi-arabia",
    title: "Construction materials supplier",
    type: "seller-opportunity",
    countryCode: "SA",
    country: "Saudi Arabia",
    industry: "Construction",
    summary:
      "An illustrative supplier opportunity for businesses exploring regional construction markets.",
    postedAt: "2026-10-01",
    image: "/images/opportunities/construction-materials.jpg",
    illustrative: true,
  },
];
