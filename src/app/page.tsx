import type { Metadata } from "next";
import { BusinessJourneySection } from "@/components/home/business-journey-section";
import { CoreServicesSection } from "@/components/home/core-services-section";
import { FeaturedOpportunitiesSection, UpcomingEventsSection } from "@/components/home/market-sections";
import {
  GlobalFacilitationSection,
  MatchmakingSection,
  MncEcosystemSection,
  WhyMncSection,
} from "@/components/home/facilitation-sections";
import { GlobalNetworkSection } from "@/components/home/global-network-section";
import {
  GlobalCtaSection,
  SuccessStoriesSection,
} from "@/components/home/stories-cta-section";
import { HeroSection, StatsSection } from "@/components/home/hero-section";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Global Business Networking, Opportunities & Market Access",
  description:
    "Connect with global businesses, discover international opportunities, join B2B meetings and explore new markets with MNC Global Connect.",
  openGraph: {
    title: "MNC Global Connect | Global Business Connections",
    description:
      "Build meaningful international connections through business opportunities, meetings, events and market access.",
    url: "/",
    siteName: "MNC Global Connect",
    type: "website",
  },
};

export default function Home() {
  return (
    <SiteShell>
      <main id="main-content">
        <HeroSection />
        <StatsSection />
        <CoreServicesSection />
        <Reveal y={28}><FeaturedOpportunitiesSection /></Reveal>
        <Reveal y={28}><BusinessJourneySection /></Reveal>
        <Reveal y={28}><UpcomingEventsSection /></Reveal>
        <Reveal y={28}><GlobalNetworkSection /></Reveal>
        <Reveal y={28}><MatchmakingSection /></Reveal>
        <Reveal y={28}><GlobalFacilitationSection /></Reveal>
        <Reveal y={28}><WhyMncSection /></Reveal>
        <Reveal y={28}><MncEcosystemSection /></Reveal>
        <Reveal y={28}><SuccessStoriesSection /></Reveal>
        <Reveal y={28}><GlobalCtaSection /></Reveal>
      </main>
    </SiteShell>
  );
}
