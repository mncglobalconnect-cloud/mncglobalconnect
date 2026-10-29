import { EventCard, OpportunityCard } from "@/components/home/market-sections";
import { PageHero } from "@/components/layout/page-hero";
import { SiteShell } from "@/components/layout/site-shell";
import { Container } from "@/components/ui/container";
import { getPublicListings } from "@/lib/server/listings";
import type { ListingKind } from "@/types/listing";

export async function ListingsPage({ kind }: { kind: ListingKind }) {
  const { items, error } = await getPublicListings(kind);
  const isEvent = kind === "events";
  return (
    <SiteShell>
      <main id="main-content">
        <PageHero
          eyebrow={isEvent ? "Global events" : "Business opportunities"}
          title={isEvent ? "Upcoming global events" : "Explore global business opportunities"}
          description={isEvent ? "Discover networking events, B2B meetings and international programmes. Details and registration open on the organiser's website in a new tab." : "Discover buyer requirements, trade leads and international partnerships. Each listing opens its website in a new tab."}
        />
        <Container className="py-12">
          {error ? <p role="alert" className="text-rose-700">{error}</p> : items.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => isEvent ? <EventCard key={item.id} event={item} /> : <OpportunityCard key={item.id} opportunity={item} />)}
            </div>
          ) : <p className="py-10 text-center text-slate-500">No {isEvent ? "upcoming events" : "opportunities"} published yet. Please check back soon.</p>}
        </Container>
      </main>
    </SiteShell>
  );
}
