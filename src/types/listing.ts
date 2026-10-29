export type ListingKind = "events" | "opportunities";

export interface ListingInput {
  kind: ListingKind;
  title: string;
  category: string;
  country: string;
  countryCode: string;
  city: string;
  industry: string;
  date: string;
  summary: string;
  image: string;
  redirectUrl: string;
  published: boolean;
}

export interface Listing extends ListingInput {
  id: string;
}
