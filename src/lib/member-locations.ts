import type { MemberLocation } from "@/types/member-location";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isMemberLocation(value: unknown): value is MemberLocation {
  return isRecord(value)
    && typeof value.id === "string" && typeof value.city === "string"
    && typeof value.country === "string" && typeof value.countryCode === "string"
    && typeof value.latitude === "number" && Math.abs(value.latitude) <= 90
    && typeof value.longitude === "number" && Math.abs(value.longitude) <= 180
    && typeof value.members === "number" && value.members >= 0
    && (value.hub === undefined || typeof value.hub === "boolean");
}

/** Validates an API payload and orders locations by member count, largest first. */
export function parseMemberLocations(payload: unknown): MemberLocation[] {
  if (!isRecord(payload) || !Array.isArray(payload.locations)) {
    throw new Error("Member locations response is invalid.");
  }
  return payload.locations.filter(isMemberLocation).sort((a, b) => b.members - a.members);
}

/** The origin for route arcs: the flagged hub, otherwise the largest location. */
export function hubLocation(locations: readonly MemberLocation[]) {
  return locations.find((location) => location.hub)
    ?? locations.reduce<MemberLocation | undefined>((best, location) => (!best || location.members > best.members ? location : best), undefined);
}
