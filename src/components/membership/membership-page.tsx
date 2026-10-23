"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, BadgeCheck, Check, ChevronDown, Compass, Globe2, Handshake, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { membershipPlans, comparisonBenefits, formatMembershipPrice, joiningSteps, nextSteps } from "@/data/membership";
import type { MembershipSelection, MembershipPlanId } from "@/types/membership";
import { NetworkVisual } from "./network-visual";
import { MembershipForm } from "./membership-form";
import { RegionToggle } from "./form-fields";

const benefits = [
  { title: "Global Business Access", icon: Globe2, items: ["Build visibility across markets", "Discover buyers and suppliers", "Connect with relevant businesses", "Access country and industry networks"] },
  { title: "Opportunities & Matchmaking", icon: Compass, items: ["Business opportunities & buyer requirements", "Seller opportunities & trade leads", "Joint ventures & import / export requirements", "Relevant business matching"] },
  { title: "Facilitation & Growth", icon: Handshake, items: ["B2B & buyer-seller meetings", "International introductions", "Business delegations & market access support", "Structured follow-up"] },
];
const values = [
  { title: "Visibility & Discovery", items: ["Verified company profile", "Searchable business listing", "Product/service visibility", "Industry and country discovery"] },
  { title: "Connections & Opportunities", items: ["Buyer-seller connections", "Qualified introductions", "Trade and partnership opportunities", "Relevant business recommendations"] },
  { title: "Facilitation & Access", items: ["B2B meeting support", "Events and delegations", "International market connections", "Structured follow-up"] },
];
const faqs = [
  ["Who can apply?", "Businesses, entrepreneurs, professionals, manufacturers, buyers, suppliers, institutions and service providers can express interest. Access is application-based and subject to business review."],
  ["Are these final membership prices?", "No. The prices and plan benefits shown are editable prototype proposals, not a fixed business policy or an offer to purchase. Final eligibility, benefits, taxes and payment terms require confirmation before payment."],
  ["Does membership guarantee leads or business?", "No. MNC Global Connect is designed to facilitate relevant connections and opportunities. Leads, introductions, meetings, revenue, contracts and investments are not guaranteed."],
  ["How are my business details verified?", "In the planned service, email and mobile verification will be followed by a business review. This browser-only prototype does not send verification messages, perform checks or activate memberships."],
  ["Can I save my application and return later?", "Yes. Use Save Progress to explicitly save a draft in this browser on this device. It is not encrypted or synced. Avoid saving on shared devices. Documents are never uploaded; saved drafts retain file metadata only."],
  ["What happens after I submit?", "This prototype generates a local demo reference and next-step checklist. Nothing is sent to MNC Global Connect. The production flow will require verification, review, approval and a payment invitation before member activation."],
  ["Can I apply from outside India?", "Yes. Switch to Global to view illustrative USD pricing. The form supports international business addresses and optional registration details. You can select a different billing region independently of your business location."],
];

export function MembershipPage() {
  const reducedMotion = useReducedMotion();
  const [selection, setSelection] = useState<MembershipSelection>({ region: "india", plan: "professional" });
  const application = useRef<HTMLDivElement>(null);
  function choosePlan(plan: MembershipPlanId) {
    setSelection((previous) => ({ ...previous, plan }));
    application.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return (
    <>
      <section className="join-hero">
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <p className="section-eyebrow mb-6 !leading-6">Global connections. Real business opportunities.</p>
            <h1 className="join-hero-title">Join a <span className="brand-text-gradient">Global Network</span><br />Built for Business Growth.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#617087]">Connect with businesses, buyers, suppliers, distributors, service providers and international partners through one structured global business network.</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#617087]">Discover opportunities, request qualified introductions, participate in B2B meetings and expand into new markets with MNC Global Connect.</p>
            <div className="my-7 flex flex-wrap gap-x-5 gap-y-3">
              {["Verified Business Profiles", "Global Business Connections", "B2B Facilitation", "International Opportunities", "Market Access"].map((text) => <span key={text} className="inline-flex items-center gap-2 text-xs font-medium text-[#324c65]"><BadgeCheck size={15} className="text-[#218864]" aria-hidden="true" />{text}</span>)}
            </div>
            <div className="flex flex-wrap gap-3">
              <a className="join-button" href="#application">Apply to Join the Network <ArrowRight size={16} aria-hidden="true" /></a>
              <a className="join-button join-button-secondary" href="#membership-plans">View Membership Plans</a>
            </div>
            <p className="mt-5 text-xs leading-6 text-[#617087]">Application-based access. Business details are reviewed before activation.</p>
          </div>
          <NetworkVisual />
        </Container>
      </section>

      <section className="join-section" aria-labelledby="why-join-title">
        <Container>
          <div className="join-section-heading"><p className="section-eyebrow">Why join</p><h2 id="why-join-title" className="section-title">Built to Turn Connections<br />into Business Opportunities.</h2><p>MNC Global Connect goes beyond simple networking by helping members identify relevant connections, access qualified opportunities and participate in structured business interactions.</p></div>
          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map(({ title, icon: Icon, items }, i) => <motion.article key={title} className="join-benefit-card join-reveal" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : i * 0.06 }}><div className="mb-6 flex items-center justify-between"><span className="join-icon"><Icon aria-hidden="true" size={23} /></span><span className="text-xs font-semibold text-[#8c9fb3]">0{i + 1}</span></div><h3 className="mb-5 text-lg font-semibold text-[#082b59]">{title}</h3><ul className="join-check-list">{items.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></motion.article>)}
          </div>
        </Container>
      </section>

      <section id="membership-plans" className="join-section bg-[#f5f9fd]" aria-labelledby="plans-title">
        <Container>
          <div className="join-section-heading"><p className="section-eyebrow">Membership plans</p><h2 id="plans-title" className="section-title">Choose the Access Level<br />That Fits Your Business.</h2><p>Select your market and compare available membership options. Final taxes and payment terms can be confirmed before checkout.</p></div>
          <div className="mb-8 flex justify-center"><RegionToggle name="pricing-region" region={selection.region} onChange={(region) => setSelection((previous) => ({ ...previous, region }))} /></div>
          <p className="mx-auto mb-9 max-w-2xl text-center text-xs leading-6 text-[#617087]"><strong className="font-semibold text-[#34536e]">Illustrative pricing & benefits.</strong> These editable initial plans are subject to business approval. Taxes and event or delegation participation fees may be additional. No payment is collected here.</p>
          <div className="grid items-stretch gap-6 lg:grid-cols-3" aria-live="polite" aria-atomic="false">
            {membershipPlans[selection.region].map((plan) => (
              <article key={plan.id} className={`join-plan ${plan.highlighted ? "join-plan-featured" : ""}`}>
                <div className="mb-4 min-h-6">{plan.highlighted ? <span className="join-popular">Most popular</span> : <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#617087]">{plan.id === "connect" ? "Build your foundation" : "Expand your horizons"}</span>}</div>
                <h3 className="text-xl font-bold text-[#082b59]">{plan.name}</h3>
                <p className="mt-3 min-h-14 text-sm leading-6 text-[#617087]">{plan.description}</p>
                <p className="my-7 flex items-baseline gap-2"><span className="join-price">{formatMembershipPrice(plan)}</span><span className="text-sm text-[#617087]">/ {plan.billingPeriod}</span></p>
                <button type="button" className={`join-button mb-7 w-full ${plan.highlighted ? "" : "join-button-secondary"}`} onClick={() => choosePlan(plan.id)}>{plan.cta}<ArrowRight size={15} aria-hidden="true" /></button>
                <div className="border-t border-[#e4ebf3] pt-6">
                  <p className="mb-4 min-h-10 text-xs font-semibold leading-5 text-[#34536e]">{plan.includes ?? "Your essential business network access"}</p>
                  <ul className="join-check-list">{plan.features.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-16">
            <h3 className="mb-5 text-center text-2xl font-semibold text-[#082b59]">Compare Membership Benefits</h3>
            <p className="mb-5 text-center text-xs text-[#617087]" id="comparison-help">Proposed access levels. Scroll horizontally on smaller screens.</p>
            <div className="join-comparison" role="region" aria-label="Membership comparison" aria-describedby="comparison-help" tabIndex={0}>
              <table><caption className="sr-only">Illustrative membership benefits by access level</caption><thead><tr><th scope="col">Membership benefits</th>{membershipPlans[selection.region].map((plan) => <th scope="col" key={plan.id}>{plan.name}</th>)}</tr></thead><tbody>
                {comparisonBenefits.map((benefit) => <tr key={benefit.label}><th scope="row">{benefit.label}</th>{membershipPlans[selection.region].map((plan) => { const access = benefit.access[plan.id]; return <td key={plan.id}>{access === true ? <><Check className="mx-auto text-[#218864]" size={17} aria-hidden="true" /><span className="sr-only">Included</span></> : access === false ? <><span aria-hidden="true">&mdash;</span><span className="sr-only">Not included</span></> : access}</td>; })}</tr>)}
              </tbody></table>
            </div>
          </div>
        </Container>
      </section>

      <section className="join-section">
        <Container>
          <div className="join-section-heading"><p className="section-eyebrow">Member value</p><h2 className="section-title">More Than Networking.</h2><p>A considered path from being discovered to building the right business relationships.</p></div>
          <div className="grid gap-8 md:grid-cols-3">{values.map((value, i) => <div key={value.title} className="join-value"><span className="text-xs font-bold text-[#148ce0]">0{i + 1}</span><h3 className="mb-5 mt-3 text-xl font-semibold text-[#082b59]">{value.title}</h3><ul className="join-check-list">{value.items.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></div>)}</div>
        </Container>
      </section>

      <section className="join-section border-t border-[#e4ebf3] bg-[#fbfdff]">
        <Container>
          <div className="join-section-heading"><p className="section-eyebrow">Your membership journey</p><h2 className="section-title">Join in a Few Simple Steps.</h2><p>Apply with confidence. Full verification and activation will be available when the live service launches.</p></div>
          <ol className="join-journey">{joiningSteps.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
          <p className="mt-7 text-center text-xs leading-6 text-[#617087]">The application below gathers your initial profile and plan preference. Verification, review, approval and payment are future service steps.</p>
        </Container>
      </section>

      <div ref={application} id="application" className="join-application">
        <Container>
          <div className="join-section-heading"><p className="section-eyebrow !text-[#70d8de]">Join the global network</p><h2 className="section-title !text-white">Apply for MNC Global<br className="hidden sm:block" /> Connect Membership</h2><p className="!text-[#bed0e3]">Tell us about you and your business. Your information helps us understand your profile and recommend relevant business connections and opportunities.</p></div>
          <div className="mx-auto mb-7 flex max-w-3xl items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4 text-sm leading-6 text-[#d5e5f3]"><ShieldCheck className="mt-1 shrink-0 text-[#6cdbb0]" size={20} aria-hidden="true" /><p><strong className="text-white">Browser-only prototype.</strong> No information is sent to MNC Global Connect. Do not enter confidential business information or real regulatory documents. Draft saving is optional and local to this device.</p></div>
          <MembershipForm selection={selection} onSelectionChange={setSelection} />
        </Container>
      </div>

      <section className="join-section" aria-labelledby="next-steps-title">
        <Container>
          <div className="join-section-heading"><p className="section-eyebrow">After your application</p><h2 id="next-steps-title" className="section-title">A Clear Path to Activation.</h2><p>Once the live service is available, here is what follows your application. This prototype does not initiate these steps.</p></div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{nextSteps.map((step, i) => <li key={step} className="rounded-2xl border border-[#e4ebf3] p-5"><span className="text-xs font-bold text-[#148ce0]">0{i + 1}</span><p className="mt-3 text-sm font-semibold leading-6 text-[#082b59]">{step}</p></li>)}</ol>
        </Container>
      </section>
      <section className="join-section bg-[#f5f9fd]" aria-labelledby="membership-faq">
        <Container className="!max-w-4xl">
          <div className="join-section-heading"><p className="section-eyebrow">A little more clarity</p><h2 id="membership-faq" className="section-title">Membership, Explained.</h2></div>
          <div className="space-y-3">{faqs.map(([question, answer]) => <details className="join-faq" key={question}><summary>{question}<ChevronDown size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
        </Container>
      </section>
    </>
  );
}
