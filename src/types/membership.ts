export type BillingRegion = "india" | "global";
export type MembershipPlanId = "connect" | "professional" | "global-pro";

export interface MembershipPlan {
  id: MembershipPlanId;
  name: string;
  price: number;
  currency: "INR" | "USD";
  billingPeriod: "year";
  description: string;
  highlighted: boolean;
  includes?: string;
  features: string[];
  cta: string;
}

export interface PersonalDetails {
  fullName: string;
  designation: string;
  email: string;
  dialCode: string;
  mobile: string;
  residence: string;
}

export interface BusinessDetails {
  company: string;
  brand: string;
  type: string;
  category: string;
  subCategory: string;
  industry: string;
  established: string;
  employees: string;
  description: string;
  products: string;
  website: string;
  linkedin: string;
  social: string;
}

export interface BusinessAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  district: string;
  postalCode: string;
  country: string;
  mapsUrl: string;
}

export interface BusinessVerification {
  gstin: string;
  cin: string;
  udyam: string;
  iec: string;
  registration: string;
  tax: string;
  tradeRegistration: string;
  other: string;
}

export interface NetworkingInterests {
  roles: string[];
  interests: string[];
  currentMarkets: string[];
  targetCountries: string[];
  targetRegions: string[];
  preferredIndustries: string[];
  preferredConnections: string[];
  exportInterest: string;
  importInterest: string;
  objectives: string;
}

export interface BusinessRequirement {
  enabled: boolean;
  type: string;
  title: string;
  description: string;
  country: string;
  value: string;
  timeline: string;
}

export interface ReferralInformation {
  sponsorId: string;
  referredBy: string;
  referrerName: string;
  referralCode: string;
  coupon: string;
}

export interface MembershipSelection {
  region: BillingRegion;
  plan: MembershipPlanId;
}

export interface DocumentMetadata {
  kind: string;
  name: string;
  size: number;
  type: string;
}

export interface ConsentState {
  accurate: boolean;
  terms: boolean;
  privacy: boolean;
  conduct: boolean;
  marketing: boolean;
}

export interface MembershipApplication {
  personal: PersonalDetails;
  business: BusinessDetails;
  address: BusinessAddress;
  verification: BusinessVerification;
  networking: NetworkingInterests;
  requirement: BusinessRequirement;
  referral: ReferralInformation;
  membership: MembershipSelection;
  documents: DocumentMetadata[];
  consent: ConsentState;
}

export interface ApplicationReceipt {
  id: string;
  createdAt: string;
  membership: MembershipSelection;
}
