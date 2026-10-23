import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { BookmarkButton } from "@/components/home/bookmark-button";
import { Container } from "@/components/ui/container";
import { CountryFlag } from "@/components/ui/country-flag";
import { events } from "@/data/events";
import { opportunities } from "@/data/opportunities";
import type { BusinessEvent } from "@/types/event";
import type { BusinessOpportunity, OpportunityType } from "@/types/opportunity";

const opportunityLabels: Record<OpportunityType, string> = {
  "buyer-requirement": "Buyer requirement",
  "seller-opportunity": "Supplier opportunity",
  "trade-lead": "Export opportunity",
  "joint-venture": "Joint venture",
  "distribution-partner": "Distribution partner",
  "technology-partnership": "Technology partnership",
};

function countryFlag(code: string) {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((letter) => 127397 + letter.charCodeAt(0)),
  );
}

function OpportunityCard({ opportunity }: { opportunity: BusinessOpportunity }) {
  const posted = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${opportunity.postedAt}T12:00:00`));

  return (
    <article className="market-card group overflow-hidden rounded-[17px] border border-[#e6edf4] bg-white">
      <Link
        href={`/opportunities/${opportunity.id}`}
        className="relative block aspect-[1.55/1] overflow-hidden bg-[#eaf2f8]"
        aria-label={`View ${opportunity.title}`}
      >
        <Image
          src={opportunity.image}
          alt=""
          fill
          sizes="(max-width: 639px) 84vw, (max-width: 1023px) 45vw, 290px"
          className="market-card-image object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#082b59]/40 via-transparent to-black/5" />
        {opportunity.illustrative && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-slate-600 backdrop-blur">
            Illustrative listing
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full border border-white/35 bg-[#082b59]/75 px-3 py-1.5 text-[10px] font-semibold capitalize text-white backdrop-blur">
          {opportunityLabels[opportunity.type]}
        </span>
      </Link>
      <div className="p-4 sm:p-4.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-[#53657c]">
            <CountryFlag code={opportunity.countryCode} />
            <span className="truncate whitespace-nowrap">{opportunity.country}</span>
          </p>
          <span
            className="flex shrink-0 items-center gap-1 text-[9px] font-medium text-[#258c69]"
            title="Business listing information is presented for connection purposes."
          >
            <BadgeCheck aria-hidden="true" className="size-3.5" />
            Network listing
          </span>
        </div>
        <Link href={`/opportunities/${opportunity.id}`} className="block">
          <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-[1.45] text-[#10213a] transition-colors group-hover:text-[#0878c7]">
            {opportunity.title}
          </h3>
        </Link>
        <div className="mt-3 flex items-center justify-between border-t border-[#edf1f5] pt-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-[#617087]">
              {opportunity.industry}
            </p>
            <p className="mt-1 text-[10px] text-[#8a97a8]">Posted {posted}</p>
          </div>
          <BookmarkButton title={opportunity.title} />
        </div>
      </div>
    </article>
  );
}

function EventCard({ event }: { event: BusinessEvent }) {
  const date = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  const eventCountryCode: Record<string, string> = {
    Singapore: "SG",
    "United Kingdom": "GB",
    Germany: "DE",
  };
  const code = eventCountryCode[event.country];

  return (
    <article className="market-card group overflow-hidden rounded-[17px] border border-[#e6edf4] bg-white">
      <Link
        href={`/events/${event.id}`}
        className="relative block aspect-[1.55/1] overflow-hidden bg-[#eaf2f8]"
        aria-label={`View ${event.title}`}
      >
        <Image
          src={event.image}
          alt=""
          fill
          sizes="(max-width: 639px) 84vw, (max-width: 1023px) 45vw, 290px"
          className="market-card-image object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#082b59]/45 via-transparent to-black/5" />
        <span className="absolute left-3 top-3 flex min-w-12 flex-col items-center rounded-xl bg-white px-2.5 py-2 shadow-sm">
          <span className="text-lg font-bold leading-none text-[#082b59]">{day}</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#148ce0]">
            {month}
          </span>
        </span>
        {event.illustrative && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-slate-600 backdrop-blur">
            Programme example
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full border border-white/35 bg-[#082b59]/75 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
          {event.type}
        </span>
      </Link>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-[1.45] text-[#10213a] transition-colors group-hover:text-[#0878c7]">
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#617087]">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-[#148ce0]" />
          {code && (
            <span aria-hidden="true" className="text-base leading-none">
              {countryFlag(code)}
            </span>
          )}
          <span className="truncate">
            {event.city}
            {event.city !== event.country ? `, ${event.country}` : ""}
          </span>
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-[#edf1f5] pt-3">
          <span className="text-[10px] font-medium text-[#8795a6]">
            {event.illustrative ? "Example programme" : "Upcoming programme"}
          </span>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#148ce0] hover:text-[#082b59]"
          >
            Explore <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FeaturedOpportunitiesSection() {
  return (
    <section className="bg-white py-[76px] sm:py-[88px]">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Curated for your next move</p>
            <h2 className="section-title mt-3 max-w-3xl">
              Featured business <span className="brand-text-gradient">opportunities.</span>
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#66778d] sm:text-[15px]">
              Explore handpicked opportunities from our global business network.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-[#0878c7] transition hover:gap-3"
          >
            View all opportunities <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {opportunities.slice(0, 4).map((opportunity) => (
            <div
              key={opportunity.id}
              className="w-[82vw] max-w-[330px] shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <OpportunityCard opportunity={opportunity} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function UpcomingEventsSection() {
  return (
    <section className="bg-white py-[76px] sm:py-[88px]">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Connect. Meet. Expand.</p>
            <h2 className="section-title mt-3">Upcoming global events.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66778d] sm:text-[15px]">
              Join networking events, B2B meetings, buyer-seller meets and
              international business delegations.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-[#0878c7] transition hover:gap-3"
          >
            View all events <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {events.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="w-[82vw] max-w-[330px] shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-[#8795a6]">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          Example programmes are illustrative; event availability and details are confirmed individually.
        </div>
      </Container>
    </section>
  );
}
