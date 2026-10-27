import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe2 } from "lucide-react";
import { BackToTop } from "@/components/layout/back-to-top";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Container } from "@/components/ui/container";

const footerGroups = [
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Vision & Mission", "/about"],
      ["Success Stories", "/success-stories"],
      ["Membership", "/join-network"],
    ],
  },
  {
    title: "Global Connect",
    links: [
      ["B2B Meetings", "/b2b-meetings"],
      ["Buyer-Seller Meetings", "/buyer-seller"],
      ["International Introductions", "/international-introductions"],
      ["Market Access", "/market-access"],
    ],
  },
  {
    title: "Opportunities",
    links: [
      ["Business Opportunities", "/opportunities"],
      ["Trade Opportunities", "/trade-opportunities"],
      ["Buyer Requirements", "/opportunities"],
      ["Import / Export", "/trade-opportunities"],
    ],
  },
  {
    title: "Events",
    links: [
      ["Networking Events", "/events"],
      ["Delegations", "/delegations"],
      ["Webinars", "/events"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Business Guides", "/resources"],
      ["Market Insights", "/resources"],
      ["FAQ", "/resources"],
      ["Contact", "/contact"],
    ],
  },
];

const legalLinks = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Code of Conduct", "/terms"],
];

export function Footer() {
  return (
    <footer className="site-footer relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="site-footer-glow pointer-events-none absolute inset-0 -z-10" />
      <Container>
        <div className="grid gap-8 border-b border-white/10 py-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-14">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9eef7]">
              <Globe2 aria-hidden="true" className="size-3.5" /> Business updates
            </p>
            <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.02em]">
              Stay ahead of global opportunities.
            </h2>
            <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-white/60">
              Market insights, new trade leads and upcoming programmes, in one concise update.
            </p>
          </div>
          <div className="lg:justify-self-end lg:w-full lg:max-w-[480px]">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_3fr] lg:py-14">
          <div className="max-w-xs">
            <Link href="/" aria-label="MNC Global Connect home" className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <Image src="/logo/MNCGlobalConnectLogo.png" alt="MNC Global Connect" width={2091} height={1221} className="h-12 w-auto" />
            </Link>
            <p className="mt-5 text-[14px] leading-relaxed text-white/60">
              Connecting businesses to meaningful global opportunities, partnerships and international markets.
            </p>
            <Link
              href="/join-network"
              className="group mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:border-white/40 hover:bg-white/[0.06]"
            >
              Join the network <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white/45">{group.title}</h2>
                <ul className="space-y-3">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="footer-link text-[14px] leading-snug text-white/75">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MNC Global Connect. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map(([label, href]) => (
              <Link key={label} href={href} className="transition hover:text-white">{label}</Link>
            ))}
            <span className="hidden items-center gap-1.5 text-white/40 md:inline-flex">
              Facilitating connections. Enabling global growth. <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </span>
          </div>
        </div>
      </Container>
      <BackToTop />
    </footer>
  );
}
