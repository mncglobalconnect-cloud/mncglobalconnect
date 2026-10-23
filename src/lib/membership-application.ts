import { businessCategories, businessTypes, membershipCountries, requirementTypes } from "@/data/membership";
import { industries } from "@/data/industries";
import type { ApplicationReceipt, MembershipApplication, MembershipSelection } from "@/types/membership";

export const DRAFT_KEY = "mnc-membership-draft-v1";
export const RECEIPT_KEY = "mnc-membership-receipt-v1";
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
export const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function createApplication(membership: MembershipSelection): MembershipApplication {
  return {
    personal: { fullName: "", designation: "", email: "", dialCode: "+91", mobile: "", residence: "India" },
    business: {
      company: "", brand: "", type: "", category: "", subCategory: "", industry: "",
      established: "", employees: "", description: "", products: "", website: "", linkedin: "", social: "",
    },
    address: { line1: "", line2: "", city: "", state: "", district: "", postalCode: "", country: "India", mapsUrl: "" },
    verification: { gstin: "", cin: "", udyam: "", iec: "", registration: "", tax: "", tradeRegistration: "", other: "" },
    networking: {
      roles: [], interests: [], currentMarkets: [], targetCountries: [], targetRegions: [],
      preferredIndustries: [], preferredConnections: [], exportInterest: "", importInterest: "", objectives: "",
    },
    requirement: { enabled: false, type: "", title: "", description: "", country: "", value: "", timeline: "" },
    referral: { sponsorId: "", referredBy: "", referrerName: "", referralCode: "", coupon: "" },
    membership,
    documents: [],
    consent: { accurate: false, terms: false, privacy: false, conduct: false, marketing: false },
  };
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && url.hostname.includes(".") && !url.username && !url.password;
  } catch {
    return false;
  }
}

export type ApplicationErrors = Record<string, string>;

export function validateApplicationStep(data: MembershipApplication, step: number): ApplicationErrors {
  const errors: ApplicationErrors = {};
  const required = (key: string, value: string, label: string) => {
    if (!value.trim()) errors[key] = `${label} is required.`;
  };
  if (step === 0) {
    for (const [key, label] of Object.entries({ fullName: "Full name", designation: "Designation", email: "Email", dialCode: "Country code", mobile: "Mobile number", residence: "Country of residence" })) {
      required(`personal.${key}`, data.personal[key as keyof typeof data.personal], label);
    }
    if (data.personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email.trim())) errors["personal.email"] = "Enter a valid email address.";
    if (!/^\+\d{1,4}$/.test(data.personal.dialCode)) errors["personal.dialCode"] = "Use a calling code such as +91 or +44.";
    if (data.personal.mobile.replace(/\D/g, "").length < 6 || data.personal.mobile.replace(/\D/g, "").length > 15 || !/^[+\d\s()-]+$/.test(data.personal.mobile)) errors["personal.mobile"] = "Enter a valid mobile number (6-15 digits).";
    if (!membershipCountries.includes(data.personal.residence)) errors["personal.residence"] = "Select a country from the list.";
  }
  if (step === 1) {
    for (const [key, label] of [
      ["company", "Business / company name"], ["type", "Business type"], ["category", "Business category"],
      ["subCategory", "Business sub-category"], ["industry", "Industry / sector"],
      ["description", "Business description"], ["products", "Products / services"],
    ] as const) required(`business.${key}`, data.business[key], label);
    if (!businessTypes.includes(data.business.type)) errors["business.type"] = "Select a business type.";
    if (!businessCategories[data.business.category]?.includes(data.business.subCategory)) errors["business.subCategory"] = "Select a sub-category for your business category.";
    if (![...industries, "Other"].includes(data.business.industry)) errors["business.industry"] = "Select an industry.";
    for (const key of ["website", "linkedin", "social"] as const) {
      if (data.business[key] && !isHttpUrl(data.business[key])) errors[`business.${key}`] = "Enter a complete http:// or https:// URL.";
    }
    if (data.business.established && (!/^\d{4}$/.test(data.business.established) || Number(data.business.established) < 1800 || Number(data.business.established) > new Date().getFullYear())) errors["business.established"] = "Enter a valid year, not in the future.";
  }
  if (step === 2) {
    for (const [key, label] of [
      ["line1", "Address line 1"], ["city", "City / town"], ["state", "State / province / region"],
      ["postalCode", "Postal / ZIP code"], ["country", "Business country"],
    ] as const) required(`address.${key}`, data.address[key], label);
    if (!membershipCountries.includes(data.address.country)) errors["address.country"] = "Select a country from the list.";
    if (data.address.country === "India" && !/^[1-9]\d{5}$/.test(data.address.postalCode.trim())) errors["address.postalCode"] = "Enter a valid six-digit Indian PIN code.";
    if (data.address.mapsUrl && !isHttpUrl(data.address.mapsUrl)) errors["address.mapsUrl"] = "Enter a complete http:// or https:// location URL.";
  }
  if (step === 4 && data.requirement.enabled) {
    for (const [key, label] of [
      ["type", "Requirement type"], ["title", "Requirement title"], ["description", "Requirement description"],
    ] as const) required(`requirement.${key}`, data.requirement[key], label);
    if (!requirementTypes.includes(data.requirement.type)) errors["requirement.type"] = "Select a requirement type.";
  }
  if (step === 5 && !isMembershipSelection(data.membership)) errors["membership.plan"] = "Select a valid membership plan and billing region.";
  if (step === 7) {
    for (const key of ["accurate", "terms", "privacy", "conduct"] as const) {
      if (!data.consent[key]) errors[`consent.${key}`] = "Please confirm this declaration before submitting.";
    }
  }
  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMembershipSelection(value: unknown): value is MembershipSelection {
  return isRecord(value) && ["india", "global"].includes(String(value.region))
    && ["connect", "professional", "global-pro"].includes(String(value.plan));
}

function matchesShape(value: unknown, template: unknown): boolean {
  if (Array.isArray(template)) return Array.isArray(value) && value.every((item) => typeof item === "string");
  if (isRecord(template)) return isRecord(value) && Object.entries(template).every(([key, item]) => matchesShape(value[key], item));
  return typeof value === typeof template;
}

function isMembershipApplication(value: unknown): value is MembershipApplication {
  if (!isRecord(value)) return false;
  const { documents, ...application } = value;
  const { documents: unused, ...template } = createApplication({ region: "india", plan: "professional" });
  void unused;
  return matchesShape(application, template) && isMembershipSelection(application.membership)
    && Array.isArray(documents) && documents.every((doc: unknown) => isRecord(doc)
      && typeof doc.kind === "string" && typeof doc.name === "string" && typeof doc.size === "number"
      && doc.size > 0 && doc.size <= MAX_DOCUMENT_SIZE && DOCUMENT_TYPES.includes(String(doc.type)));
}

export function parseDraft(raw: string): { application: MembershipApplication; step: number } {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.application)) throw new Error("This saved draft is invalid or from an unsupported version.");
  if (!isMembershipApplication(value.application)
    || !Number.isInteger(value.step) || Number(value.step) < 0 || Number(value.step) > 7) {
    throw new Error("This saved draft cannot be restored. Its application data is invalid.");
  }
  return { application: value.application, step: Number(value.step) };
}

export function parseReceipt(raw: string): ApplicationReceipt {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value) || typeof value.id !== "string" || !/^MNC-[A-Z0-9]{6}$/.test(value.id)
    || typeof value.createdAt !== "string" || !Number.isFinite(Date.parse(value.createdAt))
    || !isMembershipSelection(value.membership)) throw new Error("The saved demo application reference is invalid.");
  return { id: value.id, createdAt: value.createdAt, membership: value.membership };
}
