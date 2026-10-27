import { getCountryCallingCode, getExampleNumber, isSupportedCountry, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import type { BusinessVerification } from "@/types/membership";

/**
 * Calling code and an example mobile number for an ISO country code (see src/data/country-codes.ts),
 * or null where the territory has no public numbering plan.
 */
export function phonePlan(iso: string | undefined) {
  if (!iso || !isSupportedCountry(iso)) return null;
  const code = iso as CountryCode;
  const example = getExampleNumber(code, examples);
  return {
    iso: code,
    dialCode: `+${getCountryCallingCode(code)}`,
    example: example?.formatNational() ?? "",
  };
}

/** Validates a national or international mobile number against the country's numbering plan. */
export function isValidMobile(number: string, iso: string | undefined) {
  const plan = phonePlan(iso);
  const trimmed = number.trim();
  if (!plan) return /^[+\d\s()-]{6,20}$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 6;
  return isValidPhoneNumber(trimmed, plan.iso);
}

type FormatRule = { pattern: RegExp; example: string };

const postalRules: Record<string, FormatRule & { label: string }> = {
  India: { label: "PIN code", pattern: /^[1-9]\d{5}$/, example: "600001" },
  "United States": { label: "ZIP code", pattern: /^\d{5}(-\d{4})?$/, example: "10001" },
  "United Kingdom": { label: "Postcode", pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, example: "SW1A 1AA" },
  Canada: { label: "Postal code", pattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, example: "M5V 2T6" },
  Australia: { label: "Postcode", pattern: /^\d{4}$/, example: "2000" },
  Germany: { label: "Postcode (PLZ)", pattern: /^\d{5}$/, example: "60311" },
  France: { label: "Code postal", pattern: /^\d{5}$/, example: "75001" },
  Singapore: { label: "Postal code", pattern: /^\d{6}$/, example: "018956" },
  Malaysia: { label: "Postcode", pattern: /^\d{5}$/, example: "50088" },
  Japan: { label: "Postal code", pattern: /^\d{3}-?\d{4}$/, example: "100-0001" },
  "Saudi Arabia": { label: "Postal code", pattern: /^\d{5}(-\d{4})?$/, example: "11564" },
};

// Countries where most addresses have no postal code; the field becomes optional.
const noPostalCode = new Set(["United Arab Emirates", "Qatar", "Hong Kong", "Ireland"]);

export function postalRule(country: string) {
  const rule = postalRules[country];
  return {
    label: rule?.label ?? (noPostalCode.has(country) ? "P.O. Box / postal code" : "Postal / ZIP code"),
    required: !noPostalCode.has(country),
    example: rule?.example,
    isValid: (value: string) => !rule || rule.pattern.test(value.trim()),
  };
}

const identifierRules: Record<string, Partial<Record<keyof BusinessVerification, FormatRule>>> = {
  India: {
    gstin: { pattern: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, example: "33AAAAA0000A1Z5" },
    cin: { pattern: /^([LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}|[A-Z]{3}-\d{4})$/, example: "U12345TN2020PTC123456" },
    udyam: { pattern: /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/, example: "UDYAM-TN-02-0012345" },
    iec: { pattern: /^[A-Z0-9]{10}$/, example: "AAAAA0000A" },
  },
  "United States": { tax: { pattern: /^\d{2}-?\d{7}$/, example: "12-3456789" } },
  "United Kingdom": {
    registration: { pattern: /^([A-Z]{2}\d{6}|\d{8})$/, example: "01234567" },
    tax: { pattern: /^(GB)?\d{9}(\d{3})?$/, example: "GB123456789" },
  },
  "United Arab Emirates": { tax: { pattern: /^\d{15}$/, example: "100123456700003" } },
  Singapore: { registration: { pattern: /^(\d{8}[A-Z]|\d{9}[A-Z]|[TSR]\d{2}[A-Z]{2}\d{4}[A-Z])$/, example: "201912345K" } },
  Germany: { tax: { pattern: /^DE\d{9}$/, example: "DE123456789" } },
  Australia: { registration: { pattern: /^(\d{11}|\d{9})$/, example: "51824753556" } },
  Canada: { registration: { pattern: /^\d{9}([A-Z]{2}\d{4})?$/, example: "123456789RC0001" } },
};

/** Expected format for a registration identifier, if one is known for the country. */
export function identifierRule(country: string, key: keyof BusinessVerification) {
  const rule = identifierRules[country]?.[key];
  return rule ? { example: rule.example, isValid: (value: string) => rule.pattern.test(value.replace(/\s/g, "").toUpperCase()) } : null;
}

/** Identifiers of which at least one must be provided; India accepts any of its registrations. */
export function requiredIdentifiers(country: string): (keyof BusinessVerification)[] {
  return country === "India" ? ["gstin", "cin", "udyam", "registration"] : ["registration"];
}
