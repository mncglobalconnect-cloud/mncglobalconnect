export interface MemberLocation {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  members: number;
  hub?: boolean;
}

export interface MemberLocationsResponse {
  locations: MemberLocation[];
  updatedAt: string;
}
