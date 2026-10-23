import type { BusinessVerification } from "@/types/membership";

interface VerificationField {
  key: keyof BusinessVerification;
  label: string;
  helper?: string;
}

interface CountryVerification {
  fields: VerificationField[];
  registrationDocument: string;
  taxDocument: string;
  tradeDocument?: string;
}

const profiles: Record<string, CountryVerification> = {
  India: {
    fields: [
      { key: "gstin", label: "GSTIN", helper: "If GST registered." },
      { key: "cin", label: "CIN / LLPIN", helper: "For incorporated companies / LLPs." },
      { key: "udyam", label: "Udyam / MSME Number", helper: "If registered as an MSME." },
      { key: "iec", label: "IEC Code", helper: "If applicable to your import / export activity." },
      { key: "registration", label: "Company / Business Registration Number" },
    ],
    registrationDocument: "Company / Business Registration Certificate",
    taxDocument: "GST Registration Certificate",
    tradeDocument: "Importer Exporter Code (IEC) Certificate",
  },
  "United States": {
    fields: [{ key: "registration", label: "State Business Registration Number" }, { key: "tax", label: "EIN / Tax Registration Number" }],
    registrationDocument: "Articles / Certificate of Incorporation or Business Registration",
    taxDocument: "EIN Confirmation / Tax Registration Document",
  },
  "United Kingdom": {
    fields: [{ key: "registration", label: "Companies House / Business Registration Number" }, { key: "tax", label: "VAT Registration Number", helper: "If VAT registered." }],
    registrationDocument: "Certificate of Incorporation / Business Registration",
    taxDocument: "VAT Registration Certificate",
  },
  "United Arab Emirates": {
    fields: [{ key: "registration", label: "Trade Licence Number" }, { key: "tax", label: "Tax Registration Number (TRN)", helper: "If VAT registered." }],
    registrationDocument: "Valid Trade Licence",
    taxDocument: "VAT Registration Certificate",
  },
  Singapore: {
    fields: [{ key: "registration", label: "Unique Entity Number (UEN)" }, { key: "tax", label: "GST Registration Number", helper: "If GST registered." }],
    registrationDocument: "ACRA Business Profile / Registration Document",
    taxDocument: "GST Registration Document",
  },
  Germany: {
    fields: [{ key: "registration", label: "Commercial / Business Registration Number" }, { key: "tax", label: "VAT Identification Number", helper: "If VAT registered." }],
    registrationDocument: "Commercial Register Extract / Business Registration",
    taxDocument: "VAT Registration Document",
  },
  Australia: {
    fields: [{ key: "registration", label: "ABN / ACN" }, { key: "tax", label: "GST Registration Details", helper: "If GST registered." }],
    registrationDocument: "ABN / ASIC Business Registration Document",
    taxDocument: "GST Registration Document",
  },
  Canada: {
    fields: [{ key: "registration", label: "Business / Corporation Registration Number" }, { key: "tax", label: "GST / HST Registration Number", helper: "If registered." }],
    registrationDocument: "Certificate of Incorporation / Business Registration",
    taxDocument: "GST / HST Registration Document",
  },
};

const generic: CountryVerification = {
  fields: [
    { key: "registration", label: "Business Registration Number" },
    { key: "tax", label: "Tax / VAT Registration Number", helper: "If registered in your business country." },
    { key: "tradeRegistration", label: "Import / Export Registration", helper: "If applicable." },
    { key: "other", label: "Other Business Registration" },
  ],
  registrationDocument: "Business Registration Certificate",
  taxDocument: "Local Tax / VAT Registration Certificate",
  tradeDocument: "Import / Export Registration Document",
};

export function getVerificationProfile(country: string) {
  const countrySpecific = Object.hasOwn(profiles, country);
  const profile = countrySpecific ? profiles[country] : generic;
  return {
    fields: profile.fields,
    countrySpecific,
    documents: [
      { kind: profile.registrationDocument, guidance: "Required for the proposed business review, where applicable to your legal form." },
      { kind: "Business Address Proof", guidance: "Required for the proposed business review." },
      { kind: profile.taxDocument, guidance: "Only if tax / VAT / GST registered." },
      ...(profile.tradeDocument ? [{ kind: profile.tradeDocument, guidance: "Only if applicable to your import / export activity." }] : []),
      { kind: "Company Profile / Brochure", guidance: "Optional supporting document." },
      { kind: "Other Supporting Document", guidance: "Optional supporting document." },
    ],
  };
}
