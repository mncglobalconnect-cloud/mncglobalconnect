import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Handshake,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const stories = [
  {
    title: "India manufacturer meets a UAE distributor",
    marketPair: "India  →  United Arab Emirates",
    sector: "Manufacturing",
    summary:
      "A facilitated introduction opens a conversation about regional distribution.",
    icon: Handshake,
  },
  {
    title: "Indian exporter connects with a European buyer",
    marketPair: "India  →  Europe",
    sector: "International Trade",
    summary:
      "A buyer-seller meeting helps both businesses explore requirements and fit.",
    icon: Globe2,
  },
  {
    title: "Technology business explores an international JV",
    marketPair: "Cross-border partnership",
    sector: "Technology",
    summary:
      "An introduction brings potential partners together to discuss collaboration.",
    icon: Lightbulb,
  },
];

export function SuccessStoriesSection() {
  return (
    <section className="bg-white py-[76px] sm:py-[88px]">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Global connections in action</p>
            <h2 className="section-title mt-3">Business conversations with potential.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66778d]">
              Examples of the kinds of conversations MNC Global Connect helps
              businesses explore.
            </p>
          </div>
          <Link
            href="/success-stories"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-[#0878c7] transition hover:gap-3"
          >
            View all stories <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stories.map(({ title, marketPair, sector, summary, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[18px] border border-[#e6edf4] bg-white p-5 transition hover:-translate-y-1 hover:border-[#cbdff1] hover:shadow-[0_12px_28px_rgba(16,33,58,0.06)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-[14px] bg-[#148ce0]/[0.08] text-[#148ce0]">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="rounded-full bg-[#f1f7fb] px-2.5 py-1 text-[9px] font-semibold text-[#6a7a8f]">
                  Illustrative
                </span>
              </div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#148ce0]">
                {marketPair}
              </p>
              <h3 className="mt-2 min-h-12 text-[15px] font-semibold leading-6 text-[#10213a]">
                {title}
              </h3>
              <p className="mt-2 text-[10px] font-medium text-[#8795a6]">{sector}</p>
              <p className="mt-4 text-xs leading-6 text-[#718096]">{summary}</p>
              <Link
                href="/success-stories"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#148ce0]"
              >
                Explore the story <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-[#8795a6]">
          Illustrative scenarios only. Business introductions do not guarantee transaction or commercial outcomes.
        </p>
      </Container>
    </section>
  );
}

export function GlobalCtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-[#0878c7] via-[#18a5c9] to-[#35a978] py-[66px] text-white sm:py-[78px]">
      <div className="soft-map-grid pointer-events-none absolute inset-0 -z-10 opacity-30" />
      <div className="pointer-events-none absolute -right-28 -top-40 -z-10 size-[34rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-12 -top-24 -z-10 size-[26rem] rounded-full border border-white/10" />
      <Container className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
            Your next market starts with a connection
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-[40px]">
            Ready to take your business global?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-[15px]">
            Build the right connections, discover qualified opportunities and
            access international markets through MNC Global Connect.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button
            href="/join-network"
            className="border-white bg-white !bg-none text-[#0878c7] shadow-none hover:bg-white/90"
          >
            Join Global Network <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
          <Button
            href="/international-introductions"
            variant="secondary"
            className="border-white/55 bg-white/[0.06] text-white hover:bg-white/[0.14]"
          >
            Request Business Introduction
          </Button>
        </div>
      </Container>
    </section>
  );
}
