import { memberLocations } from "@/data/member-locations";
import type { MemberLocationsResponse } from "@/types/member-location";

export async function GET() {
  // Swap the sample data for a database aggregate of member business addresses.
  const body: MemberLocationsResponse = { locations: memberLocations, updatedAt: new Date().toISOString() };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
