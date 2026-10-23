"use client";

import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  Compass,
  Globe2,
  Handshake,
  Menu,
  Network,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type MenuLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type MegaMenu = {
  label: string;
  href: string;
  columns: { title: string; links: MenuLink[] }[];
};

const megaMenus: MegaMenu[] = [
  {
    label: "About",
    href: "/about",
    columns: [
      {
        title: "Our organisation",
        links: [
          { label: "About MNC Global Connect", href: "/about", icon: Building2 },
          { label: "Vision & Mission", href: "/about", icon: Compass },
          { label: "How We Work", href: "/about", icon: Sparkles },
        ],
      },
      {
        title: "Our impact",
        links: [
          { label: "MNC Ecosystem", href: "/about", icon: Network },
          { label: "Success Stories", href: "/success-stories", icon: ArrowUpRight },
          { label: "Membership", href: "/join-network", icon: UsersRound },
        ],
      },
      {
        title: "Get to know us",
        links: [
          { label: "Why MNC Global Connect", href: "/about", icon: Handshake },
          { label: "Contact", href: "/contact", icon: ArrowUpRight },
          { label: "FAQ", href: "/resources", icon: Compass },
        ],
      },
    ],
  },
  {
    label: "Network",
    href: "/network",
    columns: [
      {
        title: "Business network",
        links: [
          { label: "Global Business Network", href: "/network", icon: Globe2 },
          { label: "Domestic Network", href: "/network", icon: Building2 },
          { label: "International Network", href: "/network", icon: Globe2 },
        ],
      },
      {
        title: "Explore connections",
        links: [
          { label: "Member Directory", href: "/network", icon: UsersRound },
          { label: "Industry Network", href: "/network", icon: Compass },
          { label: "Country Network", href: "/network", icon: Globe2 },
        ],
      },
      {
        title: "Build relationships",
        links: [
          { label: "Global Partners", href: "/network", icon: Handshake },
          { label: "Buyer-Seller Network", href: "/buyer-seller", icon: Building2 },
          { label: "Business Connections", href: "/network", icon: ArrowUpRight },
        ],
      },
    ],
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    columns: [
      {
        title: "Find opportunities",
        links: [
          { label: "Business Opportunities", href: "/opportunities", icon: Sparkles },
          { label: "Buyer Requirements", href: "/opportunities", icon: Search },
          { label: "Seller Opportunities", href: "/opportunities", icon: Building2 },
        ],
      },
      {
        title: "Trade & partnerships",
        links: [
          { label: "Trade Leads", href: "/trade-opportunities", icon: ArrowUpRight },
          { label: "Joint Ventures", href: "/opportunities", icon: Handshake },
          { label: "Import / Export", href: "/trade-opportunities", icon: Compass },
        ],
      },
      {
        title: "Specialist opportunities",
        links: [
          { label: "Technology Partnerships", href: "/opportunities", icon: Sparkles },
          { label: "Investment Opportunities", href: "/opportunities", icon: Building2 },
          { label: "Tenders", href: "/trade-opportunities", icon: Compass },
        ],
      },
    ],
  },
  {
    label: "Global Connect",
    href: "/b2b-meetings",
    columns: [
      {
        title: "Meet & connect",
        links: [
          { label: "B2B Meetings", href: "/b2b-meetings", icon: UsersRound },
          { label: "Buyer-Seller Meetings", href: "/buyer-seller", icon: Handshake },
          { label: "International Introductions", href: "/international-introductions", icon: Globe2 },
        ],
      },
      {
        title: "Explore markets",
        links: [
          { label: "Business Delegations", href: "/delegations", icon: Building2 },
          { label: "Business Matchmaking", href: "/international-introductions", icon: Sparkles },
          { label: "Market Access", href: "/market-access", icon: Compass },
        ],
      },
      {
        title: "Facilitation",
        links: [
          { label: "Global Business Facilitation", href: "/about", icon: Handshake },
          { label: "Request Introduction", href: "/international-introductions", icon: ArrowUpRight },
          { label: "Request B2B Meeting", href: "/b2b-meetings", icon: ArrowUpRight },
        ],
      },
    ],
  },
  {
    label: "Events",
    href: "/events",
    columns: [
      {
        title: "Meet the network",
        links: [
          { label: "Upcoming Events", href: "/events", icon: Compass },
          { label: "Networking Events", href: "/events", icon: UsersRound },
          { label: "B2B Events", href: "/events", icon: Handshake },
        ],
      },
      {
        title: "Business programmes",
        links: [
          { label: "Buyer-Seller Meets", href: "/events", icon: Building2 },
          { label: "Trade Delegations", href: "/delegations", icon: Globe2 },
          { label: "Webinars", href: "/events", icon: Sparkles },
        ],
      },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    columns: [
      {
        title: "Learn & prepare",
        links: [
          { label: "Business Guides", href: "/resources", icon: Compass },
          { label: "Market Insights", href: "/resources", icon: Sparkles },
          { label: "Country Guides", href: "/resources", icon: Globe2 },
        ],
      },
      {
        title: "Trade & growth",
        links: [
          { label: "MNC Academy", href: "/resources", icon: Building2 },
          { label: "Trade Resources", href: "/resources", icon: ArrowUpRight },
          { label: "Downloads", href: "/resources", icon: ArrowUpRight },
        ],
      },
    ],
  },
];

function MegaMenuPanel({ menu }: { menu: MegaMenu }) {
  return (
    <div className="mega-menu-panel absolute left-0 top-[calc(100%+18px)] z-50 w-[min(890px,calc(100vw-48px))] rounded-2xl border border-slate-100 bg-white p-5 text-slate-700 shadow-[0_24px_60px_rgba(8,43,89,0.16)]">
      <div className={`grid gap-5 ${menu.columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {menu.columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {column.title}
            </h3>
            <ul className="space-y-1">
              {column.links.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2.5 text-[13px] font-medium text-slate-700 transition hover:bg-[#f2f8fc] hover:text-[#0878c7]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#148ce0]/[0.08] text-[#148ce0] transition group-hover:bg-[#148ce0]/[0.14]">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f5f9fd] px-4 py-3">
        <p className="text-xs text-slate-500">Discover what global business can make possible.</p>
        <Link
          href={menu.href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0878c7]"
        >
          Explore {menu.label} <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 text-[#10213a] shadow-[0_3px_16px_rgba(8,43,89,0.04)] backdrop-blur-xl">
      <Container className="flex min-h-[76px] items-center justify-between gap-5">
        <Link
          href="/"
          aria-label="MNC Global Connect home"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/logo/MNCGlobalConnectLogo.png"
            alt="MNC Global Connect"
            width={2091}
            height={1221}
            priority
            loading="eager"
            className="h-14 w-auto"
          />
        </Link>

        <nav aria-label="Main navigation" className="relative hidden items-center gap-1 xl:flex">
          <Link href="/" className="nav-link">
            Home
          </Link>
          {megaMenus.map((menu) => (
            <details key={menu.label} className="mega-menu group">
              <summary
                className="nav-link flex cursor-pointer list-none items-center gap-1.5"
                onClick={(event) => {
                  const currentMenu = event.currentTarget.parentElement;
                  currentMenu?.parentElement
                    ?.querySelectorAll("details.mega-menu")
                    .forEach((otherMenu) => {
                      if (otherMenu !== currentMenu) {
                        otherMenu.removeAttribute("open");
                      }
                    });
                }}
              >
                {menu.label}
                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 text-slate-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <MegaMenuPanel menu={menu} />
            </details>
          ))}
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search opportunities"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-[#082b59]"
          >
            {searchOpen ? <X aria-hidden="true" className="size-4" /> : <Search aria-hidden="true" className="size-4" />}
          </button>
          <Link href="/login" className="px-1 py-2 text-sm font-semibold text-slate-700 hover:text-[#148ce0]">
            Login
          </Link>
          <Button href="/join-network" className="min-h-10 whitespace-nowrap px-4 py-2 text-xs">
            Join Network
          </Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex size-11 items-center justify-center rounded-xl border border-slate-200 text-[#082b59] xl:hidden"
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </Container>

      {searchOpen && (
        <form
          action="/opportunities"
          role="search"
          className="border-t border-slate-100 bg-white px-5 py-4"
        >
          <Container className="flex max-w-3xl gap-3 !px-0">
            <label className="sr-only" htmlFor="site-search">
              Search business opportunities
            </label>
            <input
              id="site-search"
              name="query"
              placeholder="Search opportunities, markets or industries"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#148ce0]"
            />
            <Button type="submit" className="min-h-12 px-5">
              Search
            </Button>
          </Container>
        </form>
      )}

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-slate-100 bg-white px-5 py-4 xl:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
              Home
            </Link>
            {megaMenus.map((menu) => (
              <details key={menu.label} className="mobile-menu group">
                <summary className="mobile-nav-link flex cursor-pointer list-none items-center justify-between">
                  {menu.label}
                  <ChevronDown aria-hidden="true" className="size-4 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid gap-1 pb-2 pl-3">
                  {menu.columns.flatMap((column) => column.links).map((link) => (
                    <Link
                      key={`${menu.label}-${link.label}`}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
              Contact
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="mobile-nav-link">
              Login
            </Link>
            <Button href="/join-network" className="mt-2">
              Join Network
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
