import { countryCodes } from "@/data/country-codes";
import { industries } from "@/data/industries";
import { businessCategories, businessTypes, membershipCountries } from "@/data/membership";
import { getVerificationProfile } from "@/data/membership-verification";
import { identifierRule, isValidMobile, postalRule, requiredIdentifiers } from "@/lib/business-identity";
import type { MembershipApplication } from "@/types/membership";

export type StepErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Accepts "company.com" as well as full URLs. */
export function normaliseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isUrl(value: string) {
  try {
    const url = new URL(normaliseUrl(value));
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Documents a business must attach: its registration document and proof of address. */
export function requiredDocumentKinds(country: string) {
  return getVerificationProfile(country).documents.slice(0, 2).map(({ kind }) => kind);
}

export function validateStep(data: MembershipApplication, step: number): StepErrors {
  const errors: StepErrors = {};
  const need = (key: string, value: string, message: string) => { if (!value.trim()) errors[key] = message; };

  if (step === 0) {
    const { personal } = data;
    if (personal.fullName.trim().length < 2) errors["personal.fullName"] = "Enter your full name.";
    need("personal.designation", personal.designation, "Enter your designation.");
    if (!personal.email.trim()) errors["personal.email"] = "Enter your business email address.";
    else if (!EMAIL_PATTERN.test(personal.email.trim())) errors["personal.email"] = "Enter a valid email, like name@company.com.";
    if (!membershipCountries.includes(personal.residence)) errors["personal.residence"] = "Select your country.";
    if (!personal.mobile.trim()) errors["personal.mobile"] = "Enter your mobile or WhatsApp number.";
    else if (!isValidMobile(personal.mobile, countryCodes[personal.residence])) {
      errors["personal.mobile"] = `This isn't a valid ${personal.residence} mobile number.`;
    }
  }

  if (step === 1) {
    const { business } = data;
    need("business.company", business.company, "Enter your company name.");
    if (!businessTypes.includes(business.type)) errors["business.type"] = "Select your business type.";
    if (!businessCategories[business.category]) errors["business.category"] = "Select a business category.";
    if (!businessCategories[business.category]?.includes(business.subCategory)) errors["business.subCategory"] = "Select a sub-category.";
    if (![...industries, "Other"].includes(business.industry)) errors["business.industry"] = "Select your industry.";
    if (business.description.trim().length < 30) errors["business.description"] = "Describe your business in at least 30 characters.";
    if (business.website.trim() && !isUrl(business.website)) errors["business.website"] = "Enter a valid website, like company.com.";
    const year = Number(business.established);
    if (business.established && (!/^\d{4}$/.test(business.established) || year < 1800 || year > new Date().getFullYear())) {
      errors["business.established"] = "Enter a valid year.";
    }
  }

  if (step === 2) {
    const { address } = data;
    if (!membershipCountries.includes(address.country)) errors["address.country"] = "Select your business country.";
    need("address.state", address.state, "Select your state, province or region.");
    need("address.city", address.city, "Select or enter your city.");
    need("address.line1", address.line1, "Enter your street address.");
    const postal = postalRule(address.country);
    // Lower-case only an ordinary leading word, so acronyms like "PIN code" and "ZIP code" keep their case.
    const name = postal.label.replace(/^([A-Z])(?=[a-z])/, (letter) => letter.toLowerCase());
    if (postal.required && !address.postalCode.trim()) errors["address.postalCode"] = `Enter your ${name}.`;
    else if (address.postalCode.trim() && !postal.isValid(address.postalCode)) {
      errors["address.postalCode"] = `Enter a valid ${name}${postal.example ? `, like ${postal.example}` : ""}.`;
    }
  }

  if (step === 3) {
    const country = data.address.country;
    const fields = getVerificationProfile(country).fields;
    for (const { key, label } of fields) {
      const value = data.verification[key].trim();
      const rule = identifierRule(country, key);
      if (value && rule && !rule.isValid(value)) errors[`verification.${key}`] = `Check the ${label} format, like ${rule.example}.`;
    }
    const anyOf = requiredIdentifiers(country).filter((key) => fields.some((field) => field.key === key));
    if (!anyOf.some((key) => data.verification[key].trim())) {
      errors[`verification.${anyOf[0]}`] = anyOf.length > 1
        ? "Provide at least one registration number for your business."
        : "Enter your business registration number.";
    }
  }

  if (step === 4) {
    if (!data.networking.roles.length) errors["networking.roles"] = "Choose at least one option.";
    if (!data.networking.interests.length) errors["networking.interests"] = "Choose at least one option.";
  }

  if (step === 6) {
    for (const kind of requiredDocumentKinds(data.address.country)) {
      if (!data.documents.some((doc) => doc.kind === kind)) errors[`document.${kind}`] = "This document is required.";
    }
  }

  if (step === 7) {
    for (const key of ["accurate", "terms", "privacy", "conduct"] as const) {
      if (!data.consent[key]) errors[`consent.${key}`] = "Please confirm to submit.";
    }
  }
  return errors;
}
