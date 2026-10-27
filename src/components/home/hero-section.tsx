import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Globe2,
  Handshake,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { GlobeLoader } from "@/components/globe/globe-loader";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";

const trustPoints = [
  { icon: BadgeCheck, label: "Verified network" },
  { icon: Globe2, label: "Global opportunities" },
  { icon: Handshake, label: "Qualified introductions" }
];

export function HeroSection() {
  return (
    <section className="hero-section relative isolate overflow-hidden bg-[#082b59] text-white">
      <div className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-30" />
      <div className="hero-contours pointer-events-none absolute inset-0 -z-10 opacity-20" />
      <Container className="grid min-h-[680px] items-center gap-0 pb-24 pt-12 min-[900px]:min-h-[720px] min-[900px]:grid-cols-[0.94fr_1.06fr] min-[900px]:pb-24 min-[900px]:pt-8">
        <div className="relative z-10 max-w-[590px] py-5 min-[900px]:py-0">
          <h1 style={{ animationDelay: "0.15s" }} className="hero-enter max-w-[620px] text-[clamp(3.15rem,5vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
            Collaborate
            <br />
            Together.
            <br />
            Grow&nbsp;
            <span className="bg-gradient-to-r from-[#148ce0] via-[#20b7d5] to-[#35be84] bg-clip-text text-transparent">
              Globally.
            </span>
          </h1>
          <p style={{ animationDelay: "0.28s" }} className="hero-enter mt-6 max-w-[540px] text-[15px] leading-7 text-[#e4edf7]/75 sm:text-base sm:leading-[1.85]">
            MNC Global Connect brings businesses, entrepreneurs, buyers, sellers
            and international partners together through qualified connections,
            B2B meetings, trade opportunities, events, delegations and global
            market access.
          </p>
          <div style={{ animationDelay: "0.4s" }} className="hero-enter mt-7 flex flex-col gap-3 min-[1100px]:flex-row">
            <Button href="/opportunities" className="min-h-[50px]">
              Explore Global Opportunities
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Button>
            <Button
              href="/international-introductions"
              variant="secondary"
              className="min-h-[50px] border-white/35 bg-white/[0.03] px-5 text-white hover:border-white/60 hover:bg-white/[0.08]"
            >
              Request Business Introduction
            </Button>
          </div>
          <LinkJoin />
          <ul style={{ animationDelay: "0.55s" }} className="hero-enter mt-7 flex max-w-[590px] flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.14] pt-5">
            {trustPoints.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 text-[11px] font-medium text-white/70"
              >
                <Icon aria-hidden="true" className="size-3.5 text-[#59d7bc]" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ animationDelay: "0.2s" }} className="hero-enter-globe relative mx-auto w-full max-w-[640px] min-[900px]:ml-auto">
          <GlobeLoader />
        </div>
      </Container>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#20b7d5]/55 to-transparent" />
    </section>
  );
}

function LinkJoin() {
  return (
    <a
      href="/join-network"
      className="mt-4 inline-flex min-h-8 items-center gap-1.5 text-[13px] font-medium text-white/65 transition hover:text-white"
    >
      Join Global Network
      <ArrowUpRight aria-hidden="true" className="size-3.5" />
    </a>
  );
}

const metrics = [
  {
    value: "195+",
    label: "Countries",
    detail: "A truly global network",
    icon: Globe2,
  },
  {
    value: "50,000+",
    label: "Business Network",
    detail: "Connect with businesses",
    icon: UsersRound,
  },
  {
    value: "100+",
    label: "Industry Categories",
    detail: "Across global sectors",
    icon: Sparkles,
  },
  {
    value: "500+",
    label: "Business Opportunities",
    detail: "Discover new possibilities",
    icon: Handshake,
  },
];

export function StatsSection() {
  return (
    <section
      aria-label="Global business network at a glance"
      className="relative z-10 -mt-10 bg-transparent pb-1 sm:-mt-12"
    >
      <Container>
        <div className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-[#e8eef5] bg-white py-4 shadow-[0_18px_55px_rgba(8,43,89,0.12)] sm:grid-cols-4 sm:py-6">
          {metrics.map(({ value, label, detail, icon: Icon }, index) => (
            <div
              key={label}
              className={`relative flex min-h-[105px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 ${index > 0 ? "sm:border-l sm:border-[#e8eef5]" : ""} ${index % 2 === 1 ? "border-l border-[#e8eef5] sm:border-l" : ""} ${index >= 2 ? "border-t border-[#e8eef5] sm:border-t-0" : ""}`}
            >
              <span className="hidden size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#148ce0]/[0.08] text-[#148ce0] sm:flex">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-[25px] font-bold leading-none tracking-tight text-[#082b59] sm:text-[29px]">
                  <CountUp value={value} />
                </p>
                <p className="mt-2 text-[11px] font-semibold leading-tight text-[#243a55] sm:text-xs">
                  {label}
                </p>
                <p className="mt-1 hidden text-[10px] text-[#75849a] sm:block">
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
