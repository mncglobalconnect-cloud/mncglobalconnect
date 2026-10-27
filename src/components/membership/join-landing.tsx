"use client";

import {
  ArrowRight, BadgeCheck, Check, ChevronDown, ClipboardCheck, CreditCard, Globe2, Handshake, Minus,
  Rocket, Search, ShieldCheck, Sparkles, UsersRound,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { comparisonBenefits, formatMembershipPrice, membershipPlans } from "@/data/membership";
import type { BillingRegion, MembershipPlanId } from "@/types/membership";
import { ApplicationWizard } from "./application-wizard";
import { RegionSwitch } from "./region-switch";

const ease = [0.22, 1, 0.36, 1] as const;
// Benefits shown on each plan card before "more benefits" is expanded.
const VISIBLE_FEATURES = 5;

const stats = [
  { value: "195+", label: "Countries reached" },
  { value: "50,000+", label: "Business network" },
  { value: "100+", label: "Industry categories" },
  { value: "500+", label: "Business opportunities" },
];

const benefits = [
  {
    icon: Globe2,
    title: "Global business access",
    text: "Be visible to verified businesses across countries and industries.",
    items: ["Verified company profile", "Searchable business listing", "Country and industry networks"],
  },
  {
    icon: Sparkles,
    title: "Opportunities & matchmaking",
    text: "Discover buyer needs, supplier leads and partnership offers that fit your goals.",
    items: ["Buyer requirements & trade leads", "Joint ventures & import / export", "Relevant match recommendations"],
  },
  {
    icon: Handshake,
    title: "Facilitation & growth",
    text: "Move from introduction to structured conversations with real partners.",
    items: ["B2B & buyer-seller meetings", "International introductions", "Delegations & market access"],
  },
];

const steps = [
  { icon: ClipboardCheck, title: "Apply online", text: "Share a few essentials about you and your business." },
  { icon: Search, title: "Business review", text: "Our team verifies your details and business profile." },
  { icon: CreditCard, title: "Activate membership", text: "Once approved, confirm your plan and payment." },
  { icon: Rocket, title: "Start connecting", text: "Get introductions, opportunities and B2B meetings." },
];

const faqs = [
  ["Who can apply?", "Businesses, entrepreneurs, manufacturers, buyers, suppliers, service providers, professionals and institutions. Membership is application-based and every business is reviewed before activation."],
  ["Do I pay when I apply?", "No. Applying is free. You are only invited to pay once your business has been reviewed and approved."],
  ["Are these final membership prices?", "Prices and plan benefits shown are current proposals and may change before launch. Final pricing, taxes and payment terms are confirmed before you pay."],
  ["Does membership guarantee leads or business?", "No. MNC Global Connect facilitates relevant connections and opportunities. Leads, introductions, meetings, contracts and revenue are not guaranteed."],
  ["How are business details verified?", "Your application includes the registration numbers and documents that apply in your business country, such as GSTIN, CIN or Udyam in India. We verify your email and mobile, then review your business before approval."],
  ["Can I apply from outside India?", "Yes. Switch to Global to see USD pricing. The network welcomes businesses from every country."],
] as const;

function MemberCard() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-[460px] [perspective:1200px]">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, rotateX: 18, rotateY: -22, y: 30 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, rotateX: 8, rotateY: -12, y: [0, -10, 0] }}
        transition={reducedMotion ? undefined : {
          opacity: { duration: 0.8, delay: 0.2 },
          rotateX: { duration: 1.1, delay: 0.2, ease },
          rotateY: { duration: 1.1, delay: 0.2, ease },
          y: { duration: 6, delay: 1.3, repeat: Infinity, ease: "easeInOut" },
        }}
        className="member-card relative aspect-[1.586] w-full overflow-hidden rounded-[26px] p-7 text-white shadow-[0_40px_80px_rgba(0,0,0,0.45)]"
      >
        <div aria-hidden="true" className="member-card-shine pointer-events-none absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">MNC Global Connect</p>
              <p className="mt-1 text-[20px] font-bold tracking-tight">Professional Member</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Globe2 aria-hidden="true" className="size-6" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-8 w-11 rounded-md bg-gradient-to-br from-[#f7d98b] to-[#c9a34a] opacity-90" />
            <BadgeCheck aria-hidden="true" className="size-5 text-[#7ef2c3]" />
            <span className="text-[12px] font-semibold text-white/80">Verified business</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Member ID</p>
              <p className="mt-1 font-mono text-[16px] tracking-[0.18em]">MNC-2026-0001</p>
            </div>
            <p className="text-right text-[11px] text-white/60">Connect · Meet<br />Collaborate · Grow</p>
          </div>
        </div>
      </motion.div>
      {[
        { icon: Handshake, title: "Introduction accepted", detail: "India → UAE", className: "-bottom-8 left-2 sm:-left-10", delay: 0.9 },
        { icon: UsersRound, title: "B2B meeting booked", detail: "Singapore", className: "-top-9 right-2 sm:-right-8", delay: 1.1 },
      ].map(({ icon: Icon, title, detail, className, delay }) => (
        <motion.div
          key={title}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay, ease }}
          className={`absolute flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#0b2f5c]/80 py-2 pl-2 pr-4 shadow-[0_16px_36px_rgba(0,0,0,0.3)] backdrop-blur-md ${className}`}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#35be84]/20 text-[#7ef2c3]">
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <span>
            <span className="block text-[12.5px] font-bold text-white">{title}</span>
            <span className="block text-[11px] text-white/60">{detail}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title, text, center = true }: { eyebrow: string; title: React.ReactNode; text?: string; center?: boolean }) {
  return (
    <Reveal className={`mb-12 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-3 leading-[1.15]">{title}</h2>
      {text && <p className="mt-4 text-[16px] leading-relaxed text-slate-500">{text}</p>}
    </Reveal>
  );
}

export function JoinLanding() {
  const reducedMotion = useReducedMotion();
  const [region, setRegion] = useState<BillingRegion>("india");
  const [plan, setPlan] = useState<MembershipPlanId>("professional");
  const [compareOpen, setCompareOpen] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<MembershipPlanId[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const plans = membershipPlans[region];

  const choosePlan = (id: MembershipPlanId) => {
    setPlan(id);
    document.getElementById("apply")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  };

  const heroItem = (index: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.05 + index * 0.1, ease },
  });

  return (
    <>
      {/* Hero */}
      <section className="join-hero-dark relative isolate overflow-hidden text-white">
        <div aria-hidden="true" className="login-aurora pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden="true" className="login-grid pointer-events-none absolute inset-0 -z-10" />
        <Container className="grid items-center gap-14 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
          <div>
            <motion.p {...heroItem(0)} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9eef7]">
              <span className="size-1.5 rounded-full bg-[#35be84]" /> Membership · Applications open
            </motion.p>
            <motion.h1 {...heroItem(1)} className="mt-6 text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.035em]">
              Join the global network built for{" "}
              <span className="bg-gradient-to-r from-[#5cc8f5] via-[#20b7d5] to-[#35be84] bg-clip-text text-transparent">business growth.</span>
            </motion.h1>
            <motion.p {...heroItem(2)} className="mt-6 max-w-[560px] text-[17px] leading-[1.75] text-white/70">
              Connect with verified buyers, suppliers, distributors and partners worldwide. Get qualified introductions,
              B2B meetings and opportunities that move your business forward.
            </motion.p>
            <motion.div {...heroItem(3)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#apply" className="brand-gradient inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full px-7 text-[15px] font-bold text-white shadow-[0_14px_34px_rgba(20,140,224,0.35)] transition hover:-translate-y-0.5">
                Apply for membership <ArrowRight aria-hidden="true" className="size-4" />
              </a>
              <a href="#plans" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-white/25 px-7 text-[15px] font-bold text-white transition hover:border-white/50 hover:bg-white/[0.06]">
                Compare plans
              </a>
            </motion.div>
            <motion.ul {...heroItem(4)} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13.5px] font-medium text-white/75">
              {["Free to apply", "Every business verified", "Reach across 195+ countries"].map((item) => (
                <li key={item} className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-[#7ef2c3]" />{item}</li>
              ))}
            </motion.ul>
          </div>
          <div className="relative py-6">
            <MemberCard />
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section aria-label="Network at a glance" className="relative z-10 -mt-12">
        <Container>
          <Reveal className="grid grid-cols-2 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(8,43,89,0.12)] lg:grid-cols-4">
            {stats.map(({ value, label }, index) => (
              <div key={label} className={`px-6 py-7 text-center ${index % 2 ? "border-l" : ""} ${index > 1 ? "border-t lg:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""} border-slate-100`}>
                <p className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-tight text-[#082b59]"><CountUp value={value} /></p>
                <p className="mt-1 text-[13.5px] font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-24 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Why join" title={<>More than networking.<br /><span className="brand-text-gradient">Real business outcomes.</span></>}
            text="Membership gives you the visibility, opportunities and facilitation to build international business relationships." />
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text, items }, index) => (
              <Reveal key={title} delay={index * 0.08} className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(8,43,89,0.1)]">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--gradient)] transition-transform duration-500 group-hover:scale-x-100" />
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#148ce0]/[0.08] text-[#148ce0] transition group-hover:bg-[#148ce0] group-hover:text-white">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-6 text-[20px] font-bold text-[#082b59]">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-500">{text}</p>
                <ul className="mt-6 grid gap-3 border-t border-slate-100 pt-6">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[14px] text-slate-700">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#35be84]/15 text-[#218864]"><Check aria-hidden="true" className="size-3" /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-[#f4f8fc] py-24 sm:py-28">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four simple steps to get connected." />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-0.5 bg-gradient-to-r from-[#148ce0]/20 via-[#20b7d5]/40 to-[#35be84]/20 md:block" />
            {steps.map(({ icon: Icon, title, text }, index) => (
              <Reveal as="li" key={title} delay={index * 0.1} className="relative text-center">
                <span className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-[#148ce0] shadow-[0_12px_30px_rgba(8,43,89,0.1)] ring-1 ring-slate-100">
                  <Icon aria-hidden="true" className="size-7" />
                  <span className="brand-gradient absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white">{index + 1}</span>
                </span>
                <h3 className="mt-5 text-[17px] font-bold text-[#082b59]">{title}</h3>
                <p className="mx-auto mt-2 max-w-[240px] text-[14px] leading-relaxed text-slate-500">{text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Plans */}
      <section id="plans" className="scroll-mt-20 py-24 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Membership plans" title="Choose the plan that fits your business."
            text="Simple annual plans. Apply for free and pay only after your business is approved." />
          <Reveal className="mb-12 flex justify-center">
            <RegionSwitch region={region} onChange={setRegion} name="plans-region" />
          </Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {plans.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.08} className={`relative flex flex-col rounded-[26px] p-8 ${item.highlighted
                ? "plan-featured text-white shadow-[0_34px_70px_rgba(8,43,89,0.3)] lg:-my-4 lg:py-12"
                : "border border-slate-200/80 bg-white"}`}
              >
                {item.highlighted && (
                  <span className="brand-gradient absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_rgba(20,140,224,0.35)]">
                    Most popular
                  </span>
                )}
                <h3 className={`text-[20px] font-bold ${item.highlighted ? "text-white" : "text-[#082b59]"}`}>{item.name}</h3>
                <p className={`mt-2 min-h-[48px] text-[14px] leading-relaxed ${item.highlighted ? "text-white/70" : "text-slate-500"}`}>{item.description}</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={`${item.id}-${region}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 flex items-baseline gap-1.5"
                  >
                    <span className={`text-[42px] font-bold tracking-tight ${item.highlighted ? "text-white" : "text-[#082b59]"}`}>{formatMembershipPrice(item)}</span>
                    <span className={`text-[14px] ${item.highlighted ? "text-white/60" : "text-slate-500"}`}>/ year</span>
                  </motion.p>
                </AnimatePresence>
                <button
                  type="button"
                  onClick={() => choosePlan(item.id)}
                  className={`mt-7 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full text-[14.5px] font-bold transition hover:-translate-y-0.5 ${item.highlighted
                    ? "brand-gradient text-white shadow-[0_12px_28px_rgba(20,140,224,0.4)]"
                    : "border border-slate-200 text-[#082b59] hover:border-[#148ce0]/40 hover:bg-[#f2f8fc]"}`}
                >
                  Choose {item.name.replace("MNC ", "")} <ArrowRight aria-hidden="true" className="size-4" />
                </button>
                <p className={`mt-8 text-[12.5px] font-bold uppercase tracking-[0.12em] ${item.highlighted ? "text-white/55" : "text-slate-400"}`}>
                  {item.includes ?? "What's included"}
                </p>
                {(() => {
                  const expanded = expandedPlans.includes(item.id);
                  const hidden = item.features.length - VISIBLE_FEATURES;
                  const listId = `plan-features-${item.id}`;
                  const featureRow = (feature: string) => (
                    <li key={feature} className={`flex items-start gap-2.5 text-[14px] leading-snug ${item.highlighted ? "text-white/85" : "text-slate-600"}`}>
                      <Check aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${item.highlighted ? "text-[#7ef2c3]" : "text-[#218864]"}`} />
                      {feature}
                    </li>
                  );
                  return (
                    <>
                      <ul id={listId} className="mt-4 grid gap-3">
                        {item.features.slice(0, VISIBLE_FEATURES).map(featureRow)}
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.li
                              key="more"
                              initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <ul className="grid gap-3">{item.features.slice(VISIBLE_FEATURES).map(featureRow)}</ul>
                            </motion.li>
                          )}
                        </AnimatePresence>
                      </ul>
                      {hidden > 0 && (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={listId}
                          onClick={() => setExpandedPlans((current) => expanded ? current.filter((id) => id !== item.id) : [...current, item.id])}
                          className={`mt-4 inline-flex items-center gap-1.5 self-start rounded-full py-1 pl-6.5 text-[13px] font-semibold transition ${item.highlighted ? "text-[#9fe6f2] hover:text-white" : "text-[#0878c7] hover:text-[#082b59]"}`}
                        >
                          {expanded ? "Show fewer benefits" : `+ ${hidden} more benefits`}
                          <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </>
                  );
                })()}
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <button
              type="button"
              aria-expanded={compareOpen}
              aria-controls="plan-comparison"
              onClick={() => setCompareOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-[14px] font-bold text-[#082b59] transition hover:border-[#148ce0]/40 hover:bg-[#f2f8fc]"
            >
              {compareOpen ? "Hide" : "Compare all"} benefits
              <ChevronDown aria-hidden="true" className={`size-4 transition-transform duration-300 ${compareOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          <AnimatePresence initial={false}>
            {compareOpen && (
              <motion.div
                id="plan-comparison"
                initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="overflow-hidden"
              >
                <div className="mt-8 overflow-x-auto rounded-[22px] border border-slate-200/80 bg-white" role="region" aria-label="Membership comparison" tabIndex={0}>
                  <table className="w-full min-w-[640px] text-left text-[14px]">
                    <caption className="sr-only">Membership benefits by plan</caption>
                    <thead>
                      <tr className="bg-[#f4f8fc]">
                        <th scope="col" className="px-6 py-4 font-bold text-[#082b59]">Benefit</th>
                        {plans.map((item) => <th scope="col" key={item.id} className="px-4 py-4 text-center font-bold text-[#082b59]">{item.name.replace("MNC ", "")}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonBenefits.map((benefit) => (
                        <tr key={benefit.label} className="border-t border-slate-100">
                          <th scope="row" className="px-6 py-3.5 font-medium text-slate-700">{benefit.label}</th>
                          {plans.map((item) => {
                            const access = benefit.access[item.id];
                            return (
                              <td key={item.id} className="px-4 py-3.5 text-center text-slate-600">
                                {access === true
                                  ? <><Check aria-hidden="true" className="mx-auto size-[18px] text-[#218864]" /><span className="sr-only">Included</span></>
                                  : access === false
                                    ? <><Minus aria-hidden="true" className="mx-auto size-4 text-slate-300" /><span className="sr-only">Not included</span></>
                                    : access}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </section>

      {/* Application */}
      <section id="apply" className="join-apply relative isolate scroll-mt-16 overflow-hidden py-20 sm:py-24">
        <div aria-hidden="true" className="login-aurora pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <Container>
          <Reveal className="mb-10 grid gap-6 text-white lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9eef7]">Apply for membership</p>
              <h2 className="mt-3 text-[clamp(2rem,3.6vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.03em]">
                Your application, in eight short steps.
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/70">
                Each step asks only for what applies to your business country. Save a draft at any point and come back later.
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[13.5px] font-medium text-white/80">
              {[
                { icon: ShieldCheck, text: "Verified network" },
                { icon: Handshake, text: "Qualified introductions" },
                { icon: CreditCard, text: "Pay after approval" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2"><Icon aria-hidden="true" className="size-4 text-[#7ef2c3]" />{text}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <ApplicationWizard region={region} plan={plan} onRegionChange={setRegion} onPlanChange={setPlan} />
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-28">
        <Container className="!max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Questions, answered." />
          <div className="grid gap-3">
            {faqs.map(([question, answer], index) => {
              const open = openFaq === index;
              return (
                <Reveal key={question} delay={index * 0.04} className={`overflow-hidden rounded-2xl border bg-white transition-colors ${open ? "border-[#148ce0]/30 shadow-[0_14px_34px_rgba(8,43,89,0.07)]" : "border-slate-200/80"}`}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`faq-${index}`}
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[16px] font-bold text-[#082b59]"
                    >
                      {question}
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition ${open ? "rotate-180 bg-[#148ce0] text-white" : "bg-slate-100 text-slate-500"}`}>
                        <ChevronDown aria-hidden="true" className="size-4" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-${index}`}
                        initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                      >
                        <p className="px-6 pb-6 text-[15px] leading-relaxed text-slate-600">{answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="pb-24 sm:pb-28">
        <Container>
          <Reveal className="brand-gradient relative overflow-hidden rounded-[30px] px-8 py-14 text-center text-white sm:px-14">
            <div aria-hidden="true" className="cta-rings pointer-events-none absolute inset-0" />
            <h2 className="relative mx-auto max-w-2xl text-[clamp(1.9rem,3.6vw,2.7rem)] font-bold leading-tight tracking-[-0.025em]">
              Your next market starts with the right connection.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[16px] text-white/85">
              Join businesses building international partnerships through MNC Global Connect.
            </p>
            <a href="#apply" className="relative mt-8 inline-flex min-h-[54px] items-center gap-2 rounded-full bg-white px-8 text-[15px] font-bold text-[#082b59] shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5">
              Apply for membership <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
