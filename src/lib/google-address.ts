import type { BusinessAddress } from "../types/membership";

interface AddressComponent {
  longText?: string | null;
  shortText?: string | null;
  types: string[];
}

interface AddressPlace {
  id: string;
  addressComponents?: AddressComponent[] | null;
  formattedAddress?: string | null;
}

const countryAliases: Record<string, string> = {
  BS: "Bahamas", BN: "Brunei", CD: "Congo - Kinshasa", CG: "Congo - Brazzaville",
  CI: "Cote d'Ivoire", CV: "Cape Verde", FK: "Falkland Islands", FM: "Micronesia",
  GM: "Gambia", KR: "South Korea", KP: "North Korea", LA: "Laos", PS: "Palestinian Territories",
  RE: "Reunion", RU: "Russia", SY: "Syria", TR: "Turkiye", TW: "Taiwan",
  TZ: "Tanzania", VA: "Vatican City", VE: "Venezuela", VN: "Vietnam",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

export function parseGoogleAddress(place: AddressPlace, countries: readonly string[]): BusinessAddress {
  const components = place.addressComponents ?? [];
  const component = (type: string) => components.find((item) => item.types.includes(type));
  const text = (type: string) => component(type)?.longText ?? "";
  const countryComponent = component("country");
  const code = countryComponent?.shortText ?? "";
  const regionName = /^[A-Z]{2}$/.test(code) ? new Intl.DisplayNames(["en"], { type: "region" }).of(code) : "";
  const candidates = [countryAliases[code], countryComponent?.longText, regionName].filter((name): name is string => Boolean(name));
  const country = countries.find((name) => candidates.some((candidate) => normalize(candidate) === normalize(name)));
  if (!country) throw new Error("This address has no supported country. Choose another result or enter the address manually.");
  if (!place.id || !place.formattedAddress) throw new Error("Google returned an incomplete address. Choose another result or enter it manually.");
  const city = text("locality") || text("postal_town") || text("sublocality_level_1");
  const line1 = [text("street_number"), text("route")].filter(Boolean).join(" ")
    || text("premise") || place.formattedAddress.split(",")[0];
  const maps = new URL("https://www.google.com/maps/search/");
  maps.search = new URLSearchParams({ api: "1", query: place.formattedAddress, query_place_id: place.id }).toString();
  return {
    line1, line2: "", city,
    state: text("administrative_area_level_1"),
    district: text("administrative_area_level_2") || city,
    postalCode: text("postal_code") + (text("postal_code_suffix") ? `-${text("postal_code_suffix")}` : ""),
    country, mapsUrl: maps.toString(),
  };
}

export function getMapQuery(address: BusinessAddress) {
  if (address.mapsUrl) {
    try {
      const url = new URL(address.mapsUrl);
      const placeId = url.searchParams.get("query_place_id");
      if (url.protocol === "https:" && url.hostname === "www.google.com" && url.pathname === "/maps/search/" && placeId) {
        return `place_id:${placeId}`;
      }
    } catch {
      // Invalid links are reported by the form; preview the address fields instead.
    }
  }
  return [address.line1, address.line2, address.city, address.district !== address.city ? address.district : "", address.state, address.postalCode, address.country]
    .filter(Boolean).join(", ");
}
