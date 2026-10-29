import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { BookmarkButton } from "@/components/home/bookmark-button";
import { Container } from "@/components/ui/container";
import { CountryFlag } from "@/components/ui/country-flag";
import { opportunityLabels } from "@/lib/listings";
import { getPublicListings } from "@/lib/server/listings";
import type { Listing } from "@/types/listing";

function countryFlag(code: string) {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((letter) => 127397 + letter.charCodeAt(0)),
  );
}

export function OpportunityCard({ opportunity }: { opportunity: Listing }) {
  const posted = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${opportunity.date}T12:00:00Z`));

  return (
    <article className="market-card group overflow-hidden rounded-[17px] border border-[#e6edf4] bg-white">
      <a
        href={opportunity.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[1.55/1] overflow-hidden bg-[#eaf2f8]"
        aria-label={`View ${opportunity.title} (opens in a new tab)`}
      >
        <Image
          src={opportunity.image}
          unoptimized={!opportunity.image.startsWith("/")}
          alt=""
          fill
          sizes="(max-width: 639px) 84vw, (max-width: 1023px) 45vw, 290px"
          className="market-card-image object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#082b59]/40 via-transparent to-black/5" />
        <span className="absolute bottom-3 left-3 rounded-full border border-white/35 bg-[#082b59]/75 px-3 py-1.5 text-[10px] font-semibold capitalize text-white backdrop-blur">
          {opportunityLabels[opportunity.category]}
        </span>
      </a>
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
        <a href={opportunity.redirectUrl} target="_blank" rel="noopener noreferrer" className="block" aria-label={`${opportunity.title} (opens in a new tab)`}>
          <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-[1.45] text-[#10213a] transition-colors group-hover:text-[#0878c7]">
            {opportunity.title}
          </h3>
        </a>
        {opportunity.summary && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#617087]">{opportunity.summary}</p>}
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

export function EventCard({ event }: { event: Listing }) {
  const date = new Date(`${event.date}T12:00:00Z`);
  const day = new Intl.DateTimeFormat("en", { day: "2-digit", timeZone: "UTC" }).format(date);
  const month = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date);
  const code = event.countryCode;

  return (
    <article className="market-card group overflow-hidden rounded-[17px] border border-[#e6edf4] bg-white">
      <a
        href={event.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[1.55/1] overflow-hidden bg-[#eaf2f8]"
        aria-label={`View ${event.title} (opens in a new tab)`}
      >
        <Image
          src={event.image}
          unoptimized={!event.image.startsWith("/")}
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
        <span className="absolute bottom-3 left-3 rounded-full border border-white/35 bg-[#082b59]/75 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
          {event.category}
        </span>
      </a>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-[1.45] text-[#10213a] transition-colors group-hover:text-[#0878c7]">
          <a href={event.redirectUrl} target="_blank" rel="noopener noreferrer" aria-label={`${event.title} (opens in a new tab)`}>{event.title}</a>
        </h3>
        {event.summary && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#617087]">{event.summary}</p>}
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
            Upcoming programme
          </span>
          <a
            href={event.redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Explore ${event.title} (opens in a new tab)`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#148ce0] hover:text-[#082b59]"
          >
            Explore <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

export async function FeaturedOpportunitiesSection() {
  const { items: opportunities, error } = await getPublicListings("opportunities", 4);
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
        {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : !opportunities.length && <p className="text-sm text-[#66778d]">New opportunities will be published here soon.</p>}
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

export async function UpcomingEventsSection() {
  const { items: events, error } = await getPublicListings("events", 4);
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
          {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : !events.length && <p className="text-sm text-[#66778d]">New events will be published here soon.</p>}
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
          Event details and registration open on the organiser&apos;s website in a new tab.
        </div>
      </Container>
    </section>
  );
}
