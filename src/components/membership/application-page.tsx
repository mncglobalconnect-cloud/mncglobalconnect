"use client";

import { ArrowLeft, CreditCard, Handshake, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import type { BillingRegion, MembershipPlanId } from "@/types/membership";
import { ApplicationWizard } from "./application-wizard";

/** Stand-alone membership application (/join-network/application), opened straight from shared links. */
export function ApplicationPage({ initialRegion, initialPlan }: { initialRegion: BillingRegion; initialPlan: MembershipPlanId }) {
  const [region, setRegion] = useState<BillingRegion>(initialRegion);
  const [plan, setPlan] = useState<MembershipPlanId>(initialPlan);

  return (
    <section className="join-apply relative isolate overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div aria-hidden="true" className="login-aurora pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 text-white">
          <div>
            <Link href="/join-network" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/65 transition hover:text-white">
              <ArrowLeft aria-hidden="true" className="size-4" /> Membership plans & benefits
            </Link>
            <h1 className="mt-3 text-[clamp(1.8rem,3.2vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
              Apply for membership
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/70">
              Eight short steps, asking only for what applies to your business country. Save a draft at any point.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] font-medium text-white/80">
            {[
              { icon: ShieldCheck, text: "Verified network" },
              { icon: Handshake, text: "Qualified introductions" },
              { icon: CreditCard, text: "Pay after approval" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2"><Icon aria-hidden="true" className="size-4 text-[#7ef2c3]" />{text}</li>
            ))}
          </ul>
        </div>
        <ApplicationWizard region={region} plan={plan} onRegionChange={setRegion} onPlanChange={setPlan} />
      </Container>
    </section>
  );
}
