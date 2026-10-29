import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { ApplicationPage } from "@/components/membership/application-page";
import type { BillingRegion, MembershipPlanId } from "@/types/membership";

export const metadata: Metadata = {
  title: "Apply for Membership",
  description: "Apply to join MNC Global Connect: a verified global business network for qualified introductions, B2B meetings and market access.",
  alternates: { canonical: "/join-network/application" },
};

const plans: MembershipPlanId[] = ["connect", "professional", "global-pro"];
const regions: BillingRegion[] = ["india", "global"];

function pick<T extends string>(value: string | string[] | undefined, allowed: T[], fallback: T): T {
  const candidate = Array.isArray(value) ? value[0] : value;
  return allowed.includes(candidate as T) ? candidate as T : fallback;
}

// Optional ?plan=connect|professional|global-pro and ?region=india|global preselect the plan.
export default async function MembershipApplicationPage({ searchParams }: PageProps<"/join-network/application">) {
  const params = await searchParams;
  return (
    <SiteShell>
      <main id="main-content">
        <ApplicationPage
          initialRegion={pick(params.region, regions, "india")}
          initialPlan={pick(params.plan, plans, "professional")}
        />
      </main>
    </SiteShell>
  );
}
