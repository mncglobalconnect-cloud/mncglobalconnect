import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Compass,
  Globe2,
  Handshake,
  MessageSquareText,
  Network,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const suggestedMatches = [
  {
    name: "ABC Industries",
    location: "India · Manufacturer",
    score: "94%",
    reasons: ["Industry fit", "Requirement fit"],
    initials: "AB",
    tone: "bg-[#e7f3ff] text-[#148ce0]",
  },
  {
    name: "Global Pack Solutions",
    location: "UAE · Supplier",
    score: "89%",
    reasons: ["Geography fit", "Capacity fit"],
    initials: "GP",
    tone: "bg-[#e9f8f3] text-[#258c69]",
  },
  {
    name: "XYZ Manufacturing",
    location: "Germany · Exporter",
    score: "84%",
    reasons: ["Industry fit", "Geography fit"],
    initials: "XM",
    tone: "bg-[#f1edff] text-[#7354c5]",
  },
];

export function MatchmakingSection() {
  return (
    <section className="bg-[#f5f9fd] py-[76px] sm:py-[90px]">
      <Container>
        <div className="mb-9 max-w-2xl">
          <p className="section-eyebrow">Relevant introductions, thoughtfully made</p>
          <h2 className="section-title mt-3">Find the right business match.</h2>
          <p className="mt-4 text-sm leading-7 text-[#66778d] sm:text-[15px]">
            Share what your business is looking for and explore relevant
            connections to start a conversation.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[22px] border border-[#e4ebf3] bg-white p-5 shadow-[0_8px_26px_rgba(16,33,58,0.04)] sm:p-7">
            <div className="flex items-center gap-3 border-b border-[#edf1f5] pb-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0]">
                <SearchCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#10213a]">
                  Business requirement
                </h3>
                <p className="mt-1 text-[11px] text-[#7c8a9d]">
                  A sample of how matching starts
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <MatchField label="Looking for" value="Industrial packaging supplier" />
              <div className="grid gap-4 sm:grid-cols-2">
                <MatchField label="Target market" value="Middle East" />
                <MatchField label="Industry" value="Manufacturing" />
              </div>
              <MatchField label="Business role" value="Exporter" />
            </div>
            <Button href="/international-introductions" className="mt-6 w-full">
              Request Introduction <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>

          <div className="rounded-[22px] border border-[#e4ebf3] bg-white p-5 shadow-[0_8px_26px_rgba(16,33,58,0.04)] sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#10213a]">
                  Suggested connections
                </h3>
                <p className="mt-1 text-[11px] text-[#7c8a9d]">
                  Based on the requirement above
                </p>
              </div>
              <span className="rounded-full bg-[#e9f8f3] px-2.5 py-1 text-[9px] font-semibold text-[#258c69]">
                3 relevant profiles
              </span>
            </div>
            <div className="space-y-2.5">
              {suggestedMatches.map((match) => (
                <div
                  key={match.name}
                  className="flex items-center gap-3 rounded-xl border border-[#edf1f5] p-3"
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${match.tone}`}>
                    {match.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-semibold text-[#203650]">
                      {match.name}
                    </h4>
                    <p className="mt-1 text-[10px] text-[#8592a3]">
                      {match.location}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-[#f2f7fb] px-2 py-1 text-[9px] text-[#617087]"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#148ce0]">{match.score}</p>
                    <p className="text-[9px] text-[#8795a6]">relevance</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-[#8492a2]">
              <BadgeCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#20b7d5]" />
              Relevance indicators support discovery only; they do not guarantee
              quality, compliance or business outcomes.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function MatchField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7b8a9c]">
        {label}
      </p>
      <div className="flex min-h-11 items-center justify-between rounded-xl border border-[#e6edf4] bg-[#fbfdff] px-3.5 text-xs font-medium text-[#344b66]">
        {value}
        <ArrowRight aria-hidden="true" className="size-3.5 rotate-90 text-[#9aabba]" />
      </div>
    </div>
  );
}

const facilitationServices = [
  {
    icon: UsersRound,
    title: "B2B Meetings",
    copy: "Structured, focused meetings around business requirements.",
    href: "/b2b-meetings",
  },
  {
    icon: Handshake,
    title: "Buyer-Seller Meetings",
    copy: "Bring buyer needs and seller capabilities into conversation.",
    href: "/buyer-seller",
  },
  {
    icon: MessageSquareText,
    title: "International Introductions",
    copy: "Consent-based introductions across markets and sectors.",
    href: "/international-introductions",
  },
  {
    icon: Sparkles,
    title: "Trade Opportunities",
    copy: "Explore import, export and cross-border opportunities.",
    href: "/trade-opportunities",
  },
  {
    icon: CalendarCheck,
    title: "Business Delegations",
    copy: "Meet market participants through focused programmes.",
    href: "/delegations",
  },
  {
    icon: Globe2,
    title: "Market Access",
    copy: "Connect with partners as you explore international markets.",
    href: "/market-access",
  },
];

export function GlobalFacilitationSection() {
  return (
    <section className="bg-white py-[76px] sm:py-[90px]">
      <Container>
        <div className="mb-8 max-w-2xl">
          <p className="section-eyebrow">Global connect services</p>
          <h2 className="section-title mt-3">
            From introduction to structured business meetings.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#66778d] sm:text-[15px]">
            Practical facilitation to help businesses connect, meet and explore
            the next step in an international conversation.
          </p>
        </div>
        <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilitationServices.map(({ icon: Icon, title, copy, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex gap-4 border-b border-[#e9eef4] py-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f0f7fc] text-[#148ce0]">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-[#10213a]">
                  {title}
                </span>
                <span className="mt-2 block text-xs leading-5 text-[#718096]">
                  {copy}
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-[#9aabba] transition group-hover:translate-x-1 group-hover:text-[#148ce0]"
              />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

const trustBenefits = [
  { icon: BadgeCheck, title: "Qualified Connections" },
  { icon: Globe2, title: "International Reach" },
  { icon: Handshake, title: "Managed Introductions" },
  { icon: CalendarCheck, title: "Structured Follow-Up" },
  { icon: Compass, title: "Global Opportunities" },
  { icon: Network, title: "Business Matchmaking" },
  { icon: UsersRound, title: "Events & Delegations" },
  { icon: ShieldCheck, title: "Market Access Support" },
];

export function WhyMncSection() {
  return (
    <section className="bg-[#f5f9fd] py-[76px] sm:py-[88px]">
      <Container>
        <div className="mb-8 max-w-2xl">
          <p className="section-eyebrow">Built around meaningful business relationships</p>
          <h2 className="section-title mt-3">
            Why businesses choose
            <br className="hidden sm:block" /> MNC Global Connect.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {trustBenefits.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#e6edf4] bg-white p-4 sm:p-5"
            >
              <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0]">
                <Icon aria-hidden="true" className="size-[18px]" />
              </span>
              <h3 className="text-xs font-semibold leading-5 text-[#203650] sm:text-sm">
                {title}
              </h3>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

const ecosystemProducts = [
  {
    number: "01",
    name: "MNC Forum",
    offering: "Networking & Opportunity Exchange",
    icon: Network,
  },
  {
    number: "02",
    name: "MNC Global Connect",
    offering: "Business Facilitation & Market Access",
    icon: Handshake,
    featured: true,
  },
  {
    number: "03",
    name: "MNC Academy",
    offering: "Learning & Certification",
    icon: Building2,
  },
];

export function MncEcosystemSection() {
  return (
    <section className="bg-white py-[76px] sm:py-[90px]">
      <Container>
        <div className="mb-9 max-w-2xl">
          <p className="section-eyebrow">A connected MNC ecosystem</p>
          <h2 className="section-title mt-3">
            One ecosystem.
            <br className="hidden sm:block" />{" "}
            <span className="brand-text-gradient">Global possibilities.</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#66778d] sm:text-[15px]">
            Networking, managed business facilitation and learning—connected
            around one organisation and a shared member identity.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ecosystemProducts.map(({ number, name, offering, icon: Icon, featured }) => (
            <div
              key={name}
              className={`relative rounded-[20px] border p-6 sm:p-7 ${featured ? "border-[#cce7f6] bg-[#f4faff] shadow-[0_12px_32px_rgba(20,140,224,0.08)]" : "border-[#e6edf4] bg-white"}`}
            >
              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#148ce0] shadow-sm">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="text-xs font-bold tracking-[0.14em] text-[#a0afbf]">
                  {number}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-semibold text-[#082b59]">{name}</h3>
              <p className="mt-2 text-sm text-[#617087]">{offering}</p>
              <div className="mt-6 flex items-center gap-2 text-[10px] text-[#7c8a9d]">
                <span className="size-1.5 rounded-full bg-[#35be84]" />
                Shared organisation profile
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-start gap-2 text-[10px] leading-5 text-[#8795a6]">
          <Building2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#148ce0]" />
          Designed for future shared identity and connected services; authentication and API integration will be added as those services become available.
        </p>
      </Container>
    </section>
  );
}
