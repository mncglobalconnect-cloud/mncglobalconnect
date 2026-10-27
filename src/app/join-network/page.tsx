import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { JoinLanding } from "@/components/membership/join-landing";

export const metadata: Metadata = {
  title: "Join the Network | Membership",
  description: "Apply to join MNC Global Connect: a verified global business network for qualified introductions, B2B meetings, trade opportunities and market access.",
};

export default function JoinNetworkPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <JoinLanding />
      </main>
    </SiteShell>
  );
}
