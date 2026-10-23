export interface Country {
  code: string;
  name: string;
  region: string;
}

export const countries: Country[] = [
  { code: "AE", name: "United Arab Emirates", region: "Middle East" },
  { code: "DE", name: "Germany", region: "Europe" },
  { code: "GB", name: "United Kingdom", region: "Europe" },
  { code: "IN", name: "India", region: "Asia" },
  { code: "SG", name: "Singapore", region: "Asia" },
  { code: "US", name: "United States", region: "North America" },
];
