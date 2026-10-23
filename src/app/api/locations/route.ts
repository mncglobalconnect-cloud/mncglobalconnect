import { membershipCountries } from "@/data/membership";

const API = "https://countriesnow.space/api/v0.1/countries";
const aliases: Record<string, string> = {
  "Congo - Brazzaville": "Republic of the Congo", "Congo - Kinshasa": "Democratic Republic of the Congo",
  "Cote d'Ivoire": "Ivory Coast", "Czechia": "Czech Republic", "Eswatini": "Swaziland",
  "Hong Kong": "Hong Kong S.A.R.", "Macao": "Macau S.A.R.", "North Macedonia": "Macedonia",
  "Palestinian Territories": "Palestinian Territory Occupied", "Reunion": "Réunion",
  "Turkiye": "Turkey",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function load(path: string): Promise<unknown> {
  const response = await fetch(`${API}/${path}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Location provider returned HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  if (!isRecord(payload) || payload.error !== false || !Array.isArray(payload.data)) {
    throw new Error("Location provider returned invalid data.");
  }
  return payload.data;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const country = params.get("country") ?? "";
  const state = params.get("state");
  if (!membershipCountries.includes(country) || (state !== null && (!state.trim() || state.length > 200))) {
    return Response.json({ error: "Choose a valid country and state." }, { status: 400 });
  }
  try {
    const countries = await load("states");
    if (!Array.isArray(countries)) throw new Error("Invalid country list.");
    const match = countries.find((item: unknown) => isRecord(item) && typeof item.name === "string"
      && normalize(item.name) === normalize(aliases[country] ?? country));
    if (!isRecord(match) || typeof match.name !== "string" || !Array.isArray(match.states)) {
      return Response.json({ options: [], unavailable: true });
    }
    const states = match.states.map((item: unknown) => {
      if (!isRecord(item) || typeof item.name !== "string") throw new Error("Invalid state list.");
      return item.name;
    });
    if (state === null) return Response.json({ options: [...new Set(states)].sort() });
    if (!states.includes(state)) return Response.json({ error: "Choose a state belonging to this country." }, { status: 400 });
    const cities = await load(`state/cities/q?${new URLSearchParams({ country: match.name, state })}`);
    if (!Array.isArray(cities) || !cities.every((item: unknown) => typeof item === "string")) {
      throw new Error("Invalid locality list.");
    }
    return Response.json({ options: [...new Set<string>(cities)].sort() });
  } catch (error) {
    console.error("Location lookup failed:", error);
    return Response.json({ error: "The location service is unavailable. Retry or enter your location manually." }, { status: 502 });
  }
}
