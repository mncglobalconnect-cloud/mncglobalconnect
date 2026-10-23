import { feature } from "topojson-client";
import type {
  GeometryCollection,
  GeometryObject,
  Topology,
} from "topojson-specification";
import worldAtlas from "world-atlas/countries-110m.json";
import { ArrowRight, Building2, CalendarDays, Globe2, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const mapWidth = 1000;
const mapHeight = 510;

type WorldTopology = Topology<{
  countries: GeometryCollection;
  land: GeometryObject;
}>;

function project([longitude, latitude]: readonly [number, number]) {
  return [
    ((longitude + 180) / 360) * mapWidth,
    ((90 - latitude) / 180) * mapHeight,
  ] as const;
}

function toPath(geometry: GeoJSON.Geometry) {
  const ringPath = (coordinates: number[][]) =>
    coordinates
      .map((coordinate, index) => {
        const [x, y] = project([coordinate[0], coordinate[1]]);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + "Z";

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(ringPath).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .flatMap((polygon) => polygon.map(ringPath))
      .join(" ");
  }
  return "";
}

const topology = worldAtlas as unknown as WorldTopology;
const countryFeatures = feature(
  topology,
  topology.objects.countries,
).features;

const hubs = [
  { label: "India", coordinate: [78, 22] as const, primary: true },
  { label: "Dubai", coordinate: [55, 25] as const },
  { label: "Singapore", coordinate: [104, 1] as const },
  { label: "London", coordinate: [-2, 54] as const },
  { label: "Germany", coordinate: [10, 51] as const },
  { label: "New York", coordinate: [-74, 41] as const },
  { label: "Australia", coordinate: [134, -25] as const },
];

function WorldMap() {
  const origin = project(hubs[0].coordinate);

  return (
    <svg
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      role="img"
      aria-label="World map showing MNC Global Connect business network hubs and international routes"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="route-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#148ce0" />
          <stop offset=".56" stopColor="#20b7d5" />
          <stop offset="1" stopColor="#35be84" />
        </linearGradient>
        <radialGradient id="hub-glow">
          <stop stopColor="#20b7d5" stopOpacity=".35" />
          <stop offset="1" stopColor="#20b7d5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="#e7f0f7" stroke="#d5e4ef" strokeWidth=".75">
        {countryFeatures.map((country, index) =>
          country.geometry ? (
            <path key={`${country.id ?? "country"}-${index}`} d={toPath(country.geometry)} />
          ) : null,
        )}
      </g>
      <g
        fill="none"
        stroke="url(#route-stroke)"
        strokeDasharray="4 5"
        strokeWidth="1.5"
        opacity=".72"
      >
        {hubs.slice(1).map(({ label, coordinate }) => {
          const [x, y] = project(coordinate);
          const middleX = (origin[0] + x) / 2;
          const middleY = Math.min(origin[1], y) - 35;
          return (
            <path
              key={label}
              d={`M${origin[0]},${origin[1]} Q${middleX},${middleY} ${x},${y}`}
            />
          );
        })}
      </g>
      {hubs.map(({ label, coordinate, primary }) => {
        const [x, y] = project(coordinate);
        return (
          <g key={label}>
            <circle cx={x} cy={y} r={primary ? 21 : 14} fill="url(#hub-glow)" />
            <circle cx={x} cy={y} r={primary ? 5 : 3.5} fill={primary ? "#35be84" : "#148ce0"} />
            <circle
              cx={x}
              cy={y}
              r={primary ? 8 : 6}
              fill="none"
              stroke={primary ? "#35be84" : "#20b7d5"}
              strokeOpacity=".5"
            />
          </g>
        );
      })}
    </svg>
  );
}

const networkMetrics = [
  { label: "Business network", value: "Global reach", icon: Building2 },
  { label: "Market opportunities", value: "Across regions", icon: Globe2 },
  { label: "Business meetings", value: "Facilitated", icon: Handshake },
  { label: "Events & delegations", value: "International", icon: CalendarDays },
];

const regions = [
  "Asia",
  "Europe",
  "Middle East",
  "Africa",
  "North America",
  "South America",
  "Oceania",
];

export function GlobalNetworkSection() {
  return (
    <section className="bg-white py-[76px] sm:py-[90px]">
      <Container>
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="section-eyebrow">A connected business community</p>
            <h2 className="section-title mt-3">
              Business connections
              <br className="hidden sm:block" /> without borders.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#66778d] sm:text-[15px]">
              Explore business connections and market conversations across
              regions, industries and international markets.
            </p>
          </div>
          <Button href="/network" className="w-fit">
            Explore Global Network <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <div className="overflow-hidden rounded-[24px] border border-[#e5edf4] bg-[#f6fafe]">
          <div className="relative px-3 py-6 sm:px-8 sm:py-8">
            <div className="absolute inset-0 soft-map-grid opacity-75" />
            <div className="relative mx-auto w-full max-w-[1040px]">
              <WorldMap />
            </div>
            <div className="relative flex flex-wrap justify-center gap-2">
              {regions.map((region) => (
                <span
                  key={region}
                  className="rounded-full border border-white bg-white/90 px-3 py-1.5 text-[10px] font-medium text-[#53657c] shadow-sm"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-[#e5edf4] bg-white sm:grid-cols-4">
            {networkMetrics.map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-5 ${index % 2 === 1 ? "border-l border-[#e5edf4]" : ""} ${index > 1 ? "border-t border-[#e5edf4] sm:border-t-0" : ""} ${index > 0 ? "sm:border-l" : ""}`}
              >
                <span className="hidden size-9 shrink-0 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0] sm:flex">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-[#233a55]">{value}</p>
                  <p className="mt-1 text-[10px] text-[#7c8a9d]">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
