import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Globe2 } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { MembershipPage } from "@/components/membership/membership-page";
import "./join-network.css";

export const metadata: Metadata = {
  title: "Join the Network | Membership",
  description: "Explore MNC Global Connect membership and apply to a global business network for qualified connections, B2B meetings and market access.",
};

export default function JoinNetworkPage() {
  return (
    <div className="join-page">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-3">Skip to content</a>
      <header className="join-header">
        <Container className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" aria-label="MNC Global Connect home">
            <Image src="/logo/MNCGlobalConnectLogo.png" alt="MNC Global Connect" width={2091} height={1221} className="h-14 w-auto" loading="eager" />
          </Link>
          <span className="join-status hidden items-center gap-2 md:inline-flex"><Globe2 size={14} aria-hidden="true" /> Global business network</span>
          <nav aria-label="Membership navigation" className="flex items-center gap-4 text-xs font-semibold sm:gap-6 sm:text-sm">
            <Link href="/" className="inline-flex items-center gap-2"><ArrowLeft size={15} aria-hidden="true" /><span>Back to Website</span></Link>
            <Link href="/login" className="join-login">Login</Link>
          </nav>
        </Container>
      </header>
      <main id="main-content"><MembershipPage /></main>
      <Footer />
    </div>
  );
}
