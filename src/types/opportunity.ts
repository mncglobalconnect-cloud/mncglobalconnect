export type OpportunityType =
  | "buyer-requirement"
  | "seller-opportunity"
  | "trade-lead"
  | "joint-venture"
  | "distribution-partner"
  | "technology-partnership";

export interface BusinessOpportunity {
  id: string;
  title: string;
  type: OpportunityType;
  countryCode: string;
  country: string;
  industry: string;
  summary: string;
  postedAt: string;
  image: string;
  illustrative?: boolean;
}
