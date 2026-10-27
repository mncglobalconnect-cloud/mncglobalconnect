import type { MemberLocation } from "@/types/member-location";

// Sample aggregates until member accounts are stored server-side. Replace with a
// query that groups verified member business addresses by city.
export const memberLocations: MemberLocation[] = [
  { id: "chennai-in", city: "Chennai", country: "India", countryCode: "IN", latitude: 13.0827, longitude: 80.2707, members: 4820, hub: true },
  { id: "mumbai-in", city: "Mumbai", country: "India", countryCode: "IN", latitude: 19.076, longitude: 72.8777, members: 4310 },
  { id: "delhi-in", city: "New Delhi", country: "India", countryCode: "IN", latitude: 28.6139, longitude: 77.209, members: 3980 },
  { id: "bengaluru-in", city: "Bengaluru", country: "India", countryCode: "IN", latitude: 12.9716, longitude: 77.5946, members: 3540 },
  { id: "hyderabad-in", city: "Hyderabad", country: "India", countryCode: "IN", latitude: 17.385, longitude: 78.4867, members: 2210 },
  { id: "coimbatore-in", city: "Coimbatore", country: "India", countryCode: "IN", latitude: 11.0168, longitude: 76.9558, members: 1480 },
  { id: "kolkata-in", city: "Kolkata", country: "India", countryCode: "IN", latitude: 22.5726, longitude: 88.3639, members: 1320 },
  { id: "dubai-ae", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", latitude: 25.2048, longitude: 55.2708, members: 2650 },
  { id: "riyadh-sa", city: "Riyadh", country: "Saudi Arabia", countryCode: "SA", latitude: 24.7136, longitude: 46.6753, members: 860 },
  { id: "doha-qa", city: "Doha", country: "Qatar", countryCode: "QA", latitude: 25.2854, longitude: 51.531, members: 540 },
  { id: "singapore-sg", city: "Singapore", country: "Singapore", countryCode: "SG", latitude: 1.3521, longitude: 103.8198, members: 2120 },
  { id: "kuala-lumpur-my", city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", latitude: 3.139, longitude: 101.6869, members: 1180 },
  { id: "jakarta-id", city: "Jakarta", country: "Indonesia", countryCode: "ID", latitude: -6.2088, longitude: 106.8456, members: 640 },
  { id: "colombo-lk", city: "Colombo", country: "Sri Lanka", countryCode: "LK", latitude: 6.9271, longitude: 79.8612, members: 520 },
  { id: "tokyo-jp", city: "Tokyo", country: "Japan", countryCode: "JP", latitude: 35.6762, longitude: 139.6503, members: 690 },
  { id: "sydney-au", city: "Sydney", country: "Australia", countryCode: "AU", latitude: -33.8688, longitude: 151.2093, members: 910 },
  { id: "nairobi-ke", city: "Nairobi", country: "Kenya", countryCode: "KE", latitude: -1.2921, longitude: 36.8219, members: 760 },
  { id: "johannesburg-za", city: "Johannesburg", country: "South Africa", countryCode: "ZA", latitude: -26.2041, longitude: 28.0473, members: 580 },
  { id: "london-gb", city: "London", country: "United Kingdom", countryCode: "GB", latitude: 51.5072, longitude: -0.1276, members: 1940 },
  { id: "frankfurt-de", city: "Frankfurt", country: "Germany", countryCode: "DE", latitude: 50.1109, longitude: 8.6821, members: 1260 },
  { id: "paris-fr", city: "Paris", country: "France", countryCode: "FR", latitude: 48.8566, longitude: 2.3522, members: 720 },
  { id: "new-york-us", city: "New York", country: "United States", countryCode: "US", latitude: 40.7128, longitude: -74.006, members: 1870 },
  { id: "houston-us", city: "Houston", country: "United States", countryCode: "US", latitude: 29.7604, longitude: -95.3698, members: 830 },
  { id: "toronto-ca", city: "Toronto", country: "Canada", countryCode: "CA", latitude: 43.6532, longitude: -79.3832, members: 990 },
  { id: "sao-paulo-br", city: "São Paulo", country: "Brazil", countryCode: "BR", latitude: -23.5558, longitude: -46.6396, members: 470 },
];
