import type { BillingRegion, MembershipPlan, MembershipPlanId } from "@/types/membership";

const planDetails: Omit<MembershipPlan, "price" | "currency">[] = [
  {
    id: "connect",
    name: "MNC Connect",
    billingPeriod: "year",
    description: "For small businesses and professionals beginning their network journey.",
    highlighted: false,
    features: [
      "Verified Business Profile", "Business Directory Access", "Basic Opportunity Access",
      "Member Search", "Save Opportunities", "Networking Events Access",
      "Basic Business Introduction Requests", "Resource Library", "Member Support",
    ],
    cta: "Apply for MNC Connect",
  },
  {
    id: "professional",
    name: "MNC Professional",
    billingPeriod: "year",
    description: "For growing businesses seeking regular networking and opportunities.",
    highlighted: true,
    includes: "Everything in MNC Connect, plus",
    features: [
      "Advanced Business Directory", "Buyer & Seller Opportunities", "Trade Leads",
      "B2B Meeting Requests", "Business Introductions", "Priority Opportunity Access",
      "Domestic & International Events", "Saved Search / Opportunity Alerts",
      "Business Match Recommendations", "Advanced Support",
    ],
    cta: "Apply for MNC Professional",
  },
  {
    id: "global-pro",
    name: "MNC Global Pro",
    billingPeriod: "year",
    description: "For exporters, importers and manufacturers expanding into global markets.",
    highlighted: false,
    includes: "Everything in MNC Professional, plus",
    features: [
      "International Business Network", "Cross-Border Business Introductions",
      "International Buyer/Supplier Access", "Joint Venture Opportunities",
      "Import / Export Opportunities", "Premium B2B Facilitation", "Market Access Connections",
      "Delegation Priority", "International Partner Search", "Priority Matchmaking",
      "Premium Support", "Featured Business Visibility",
    ],
    cta: "Apply for MNC Global Pro",
  },
];

const prices: Record<BillingRegion, Record<MembershipPlanId, number>> = {
  india: { connect: 4999, professional: 9999, "global-pro": 24999 },
  global: { connect: 99, professional: 199, "global-pro": 399 },
};

export const membershipPlans: Record<BillingRegion, MembershipPlan[]> = {
  india: planDetails.map((plan) => ({ ...plan, price: prices.india[plan.id], currency: "INR" })),
  global: planDetails.map((plan) => ({ ...plan, price: prices.global[plan.id], currency: "USD" })),
};

export function formatMembershipPrice(plan: MembershipPlan) {
  return new Intl.NumberFormat(plan.currency === "INR" ? "en-IN" : "en-US", {
    style: "currency", currency: plan.currency, maximumFractionDigits: 0,
  }).format(plan.price);
}

export interface ComparisonBenefit {
  label: string;
  access: Record<MembershipPlanId, boolean | string>;
}

export const comparisonBenefits: ComparisonBenefit[] = [
  { label: "Verified Business Profile", access: { connect: true, professional: true, "global-pro": true } },
  { label: "Business Directory", access: { connect: "Basic", professional: "Advanced", "global-pro": "International" } },
  { label: "Buyer Requirements", access: { connect: "Basic access", professional: true, "global-pro": true } },
  { label: "Seller Opportunities", access: { connect: "Basic access", professional: true, "global-pro": true } },
  { label: "Trade Leads", access: { connect: false, professional: true, "global-pro": true } },
  { label: "B2B Meeting Requests", access: { connect: false, professional: true, "global-pro": "Premium facilitation" } },
  { label: "Business Introductions", access: { connect: "Basic requests", professional: true, "global-pro": "Cross-border" } },
  { label: "Joint Ventures", access: { connect: false, professional: false, "global-pro": true } },
  { label: "Import / Export Opportunities", access: { connect: false, professional: false, "global-pro": true } },
  { label: "International Network", access: { connect: false, professional: false, "global-pro": true } },
  { label: "Market Access", access: { connect: false, professional: false, "global-pro": true } },
  { label: "Delegation Priority", access: { connect: false, professional: false, "global-pro": true } },
  { label: "Opportunity Alerts", access: { connect: false, professional: true, "global-pro": true } },
  { label: "Match Recommendations", access: { connect: false, professional: true, "global-pro": "Priority" } },
  { label: "Priority Support", access: { connect: "Member support", professional: "Advanced", "global-pro": "Premium" } },
  { label: "Featured Visibility", access: { connect: false, professional: false, "global-pro": true } },
];

// Fixed labels avoid differences between browser and server ICU country names.
export const membershipCountries = (
  "Afghanistan|Albania|Algeria|American Samoa|Andorra|Angola|Anguilla|Antarctica|Antigua & Barbuda|Argentina|Armenia|Aruba|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bermuda|Bhutan|Bolivia|Bosnia & Herzegovina|Botswana|Bouvet Island|Brazil|British Indian Ocean Territory|British Virgin Islands|Brunei|Bulgaria|Burkina Faso|Burundi|" +
  "Cambodia|Cameroon|Canada|Cape Verde|Caribbean Netherlands|Cayman Islands|Central African Republic|Chad|Chile|China|Christmas Island|Cocos (Keeling) Islands|Colombia|Comoros|Congo - Brazzaville|Congo - Kinshasa|Cook Islands|Costa Rica|Croatia|Cuba|Curacao|Cyprus|Czechia|Cote d'Ivoire|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|" +
  "Falkland Islands|Faroe Islands|Fiji|Finland|France|French Guiana|French Polynesia|French Southern Territories|Gabon|Gambia|Georgia|Germany|Ghana|Gibraltar|Greece|Greenland|Grenada|Guadeloupe|Guam|Guatemala|Guernsey|Guinea|Guinea-Bissau|Guyana|Haiti|Heard & McDonald Islands|Honduras|Hong Kong|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Isle of Man|Israel|Italy|Jamaica|Japan|Jersey|Jordan|Kazakhstan|Kenya|Kiribati|Kuwait|Kyrgyzstan|" +
  "Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Macao|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Martinique|Mauritania|Mauritius|Mayotte|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Montserrat|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Caledonia|New Zealand|Nicaragua|Niger|Nigeria|Niue|Norfolk Island|North Korea|North Macedonia|Northern Mariana Islands|Norway|Oman|" +
  "Pakistan|Palau|Palestinian Territories|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Pitcairn Islands|Poland|Portugal|Puerto Rico|Qatar|Reunion|Romania|Russia|Rwanda|Samoa|San Marino|Sao Tome & Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Sint Maarten|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Georgia & South Sandwich Islands|South Korea|South Sudan|Spain|Sri Lanka|St. Barthelemy|St. Helena|St. Kitts & Nevis|St. Lucia|St. Martin|St. Pierre & Miquelon|St. Vincent & Grenadines|Sudan|Suriname|Svalbard & Jan Mayen|Sweden|Switzerland|Syria|" +
  "Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tokelau|Tonga|Trinidad & Tobago|Tunisia|Turkmenistan|Turks & Caicos Islands|Tuvalu|Turkiye|U.S. Outlying Islands|U.S. Virgin Islands|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Wallis & Futuna|Western Sahara|Yemen|Zambia|Zimbabwe|Aland Islands"
).split("|").sort();

export const businessTypes = [
  "Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship",
  "Startup", "Professional", "Institution", "Association", "NGO", "Other",
];
export const businessCategories: Record<string, string[]> = {
  "Manufacturing": ["Industrial Products", "Consumer Products", "Components", "Other Manufacturing"],
  "Trade & Distribution": ["Wholesale", "Retail", "Import / Export", "Distribution", "Other Trade"],
  "Services": ["Consulting", "Technology Services", "Financial Services", "Logistics Services", "Other Services"],
  "Agriculture & Food": ["Farming", "Food Processing", "Food Trading", "Other Agriculture"],
  "Institutions & Associations": ["Education", "Industry Association", "Non-profit", "Other Institution"],
  "Other": ["Other"],
};
export const businessRoles = [
  "Buyer", "Seller", "Manufacturer", "Exporter", "Importer", "Distributor", "Wholesaler",
  "Retailer", "Service Provider", "Consultant", "Investor", "Technology Provider",
  "Startup", "Institution", "Other",
];
export const networkingGoals = [
  "Find Buyers", "Find Suppliers", "Find Distributors", "Find Export Opportunities",
  "Find Import Opportunities", "Joint Venture Partners", "Technology Partners",
  "Investment Opportunities", "B2B Meetings", "Buyer-Seller Meetings", "Business Delegations",
  "International Introductions", "Market Access", "Networking Events", "Business Training",
];
export const targetRegions = [
  "India", "South Asia", "Southeast Asia", "Middle East", "Europe", "Africa",
  "North America", "South America", "Oceania",
];
export const requirementTypes = [
  "Buyer Requirement", "Seller Opportunity", "Trade Lead", "Joint Venture", "Import",
  "Export", "Distributor Search", "Technology Partnership", "Investment", "Service Requirement",
];
export const applicationSteps = [
  "Personal Details", "Business Profile", "Business Location", "Business Verification",
  "Networking Interests", "Membership Plan", "Documents", "Review & Submit",
];
export const joiningSteps = [
  "Submit Application", "Verify Email & Mobile", "Complete Business Profile",
  "Select Membership", "Business Review", "Approval", "Payment",
  "Member ID Activated", "Start Connecting",
];
export const nextSteps = [
  "Email / mobile verification", "Business profile review", "Membership approval",
  "Payment invitation", "Member activation",
];
