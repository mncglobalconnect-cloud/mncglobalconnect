export interface Company {
  id: string;
  name: string;
  countryCode: string;
  industries: string[];
  businessRole: "buyer" | "seller" | "partner" | "service-provider";
}
