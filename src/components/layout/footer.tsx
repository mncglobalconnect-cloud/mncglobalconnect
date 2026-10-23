import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";

const footerGroups = [
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Vision & Mission", "/about"],
      ["Success Stories", "/success-stories"],
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
    ],
  },
  {
    title: "Support",
    links: [
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Code of Conduct", "/terms"],
    ],
  },
];

const socialNetworks = [
  { name: "LinkedIn", mark: "in" },
  { name: "Facebook", mark: "f" },
  { name: "Instagram", mark: "◎" },
  { name: "YouTube", mark: "▶" },
  { name: "X", mark: "X" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#e7edf3] bg-white text-[#10213a]">
      <Container className="py-10 sm:py-12">
        <div className="grid gap-9 border-b border-[#e7edf3] pb-9 lg:grid-cols-[1.25fr_3fr]">
          <div className="max-w-xs">
            <Link href="/" aria-label="MNC Global Connect home" className="inline-flex">
              <Image
                src="/logo/MNCGlobalConnectLogo.png"
                alt="MNC Global Connect"
                width={2091}
                height={1221}
                className="h-16 w-auto"
              />
            </Link>
            <p className="mt-4 text-xs leading-6 text-[#6d7c90]">
              Connecting businesses to meaningful global opportunities,
              partnerships and international markets.
            </p>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Social media">
              {socialNetworks.map(({ name, mark }) => (
                <span
                  key={name}
                  title={name}
                  className="flex size-8 items-center justify-center rounded-full border border-[#e6edf4] text-[11px] font-semibold text-[#617087]"
                >
                  <span aria-hidden="true">{mark}</span>
                  <span className="sr-only">{name}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 text-xs font-semibold text-[#203650]">
                  {group.title}
                </h2>
                <ul className="space-y-2.5">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[10px] leading-5 text-[#718096] transition hover:text-[#0878c7]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-5 text-[10px] text-[#8795a6] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MNC Global Connect. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Facilitating connections. Enabling global growth.
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </p>
        </div>
      </Container>
    </footer>
  );
}
