"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronDown,
  Compass,
  Globe2,
  Handshake,
  Info,
  LogIn,
  Mail,
  Menu,
  Network,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  icon: LucideIcon;
  summary: string;
  columns: { title: string; links: MenuLink[] }[];
};

const megaMenus: MegaMenu[] = [
  {
    label: "About",
    href: "/about",
    icon: Info,
    summary: "Who we are, how we work and the businesses we serve.",
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
    icon: Network,
    summary: "Verified businesses and partners across industries and countries.",
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
    icon: Sparkles,
    summary: "Buyer requirements, trade leads and partnership offers.",
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
    icon: Handshake,
    summary: "Introductions, B2B meetings, delegations and market access.",
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
    icon: CalendarDays,
    summary: "Networking events, trade missions and business programmes.",
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
    icon: Compass,
    summary: "Guides, market insights and learning to prepare for new markets.",
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

const popularSearches = ["Packaging suppliers", "Textile buyers", "UAE distributors", "Trade delegations", "B2B meetings"];

/** The single menu that owns the current route: its own page first, then the first menu linking to it. */
function activeMenuLabel(pathname: string) {
  const own = megaMenus.find((menu) => pathname.startsWith(menu.href));
  if (own) return own.label;
  if (pathname.startsWith("/contact") || pathname.startsWith("/join-network")) return null;
  return megaMenus.find((menu) => menu.columns.some((column) => column.links.some((link) => pathname.startsWith(link.href))))?.label ?? null;
}

function isActive(pathname: string, menu: MegaMenu) {
  return activeMenuLabel(pathname) === menu.label;
}

function MegaMenuPanel({ menu, id, onNavigate }: { menu: MegaMenu; id: string; onNavigate: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      id={id}
      initial={reducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-full z-50"
    >
      <Container className="pt-2">
        <div className="grid overflow-hidden rounded-[22px] border border-slate-100 bg-white text-slate-700 shadow-[0_30px_70px_rgba(8,43,89,0.18)] lg:grid-cols-[1fr_290px]">
          <div className="p-6">
            <div className={`grid gap-6 ${menu.columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {menu.columns.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-3 px-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {column.title}
                  </h3>
                  <ul className="space-y-0.5">
                    {column.links.map(({ label, href, icon: Icon }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          onClick={onNavigate}
                          className="group/link flex items-center gap-3 rounded-xl px-2 py-2.5 text-[13.5px] font-semibold text-slate-700 transition hover:bg-[#f2f8fc] hover:text-[#0878c7] focus-visible:bg-[#f2f8fc] focus-visible:outline-none"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#148ce0]/[0.08] text-[#148ce0] transition group-hover/link:bg-[#148ce0] group-hover/link:text-white">
                            <Icon aria-hidden="true" className="size-4" />
                          </span>
                          <span className="flex-1">{label}</span>
                          <ArrowRight aria-hidden="true" className="size-3.5 -translate-x-1 opacity-0 transition group-hover/link:translate-x-0 group-hover/link:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <p className="text-[12.5px] text-slate-500">{menu.summary}</p>
              <Link
                href={menu.href}
                onClick={onNavigate}
                className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-[#0878c7] hover:text-[#082b59]"
              >
                Explore {menu.label} <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
          <div className="relative hidden flex-col justify-between overflow-hidden bg-[#082b59] p-6 text-white lg:flex">
            <div aria-hidden="true" className="menu-promo-glow pointer-events-none absolute inset-0" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9fe6f2]">
                <Globe2 aria-hidden="true" className="size-3" /> Membership
              </span>
              <p className="mt-4 text-[19px] font-bold leading-snug">Grow with a global business network.</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
                Apply to join for qualified introductions, business opportunities and B2B meetings.
              </p>
            </div>
            <Link
              href="/join-network"
              onClick={onNavigate}
              className="brand-gradient relative mt-6 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-bold text-white shadow-[0_8px_24px_rgba(20,140,224,0.35)] transition hover:-translate-y-0.5"
            >
              Join the Network <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-full border-t border-slate-100 bg-white shadow-[0_24px_50px_rgba(8,43,89,0.12)]"
    >
      <Container className="max-w-3xl py-6">
        <form action="/opportunities" role="search" className="relative">
          <label className="sr-only" htmlFor="site-search">Search business opportunities</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            id="site-search"
            name="query"
            autoFocus
            placeholder="Search opportunities, markets or industries"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-32 text-[15px] text-slate-800 outline-none transition focus:border-[#148ce0] focus:ring-4 focus:ring-[#148ce0]/10"
          />
          <button type="submit" className="brand-gradient absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-xl px-5 text-[13px] font-bold text-white">
            Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Popular</span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/opportunities?query=${encodeURIComponent(term)}`}
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:border-[#148ce0]/40 hover:bg-[#f2f8fc] hover:text-[#0878c7]"
            >
              {term}
            </Link>
          ))}
        </div>
      </Container>
    </motion.div>
  );
}

function MobileNavigation({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState<string | null>(
    () => megaMenus.find((menu) => isActive(pathname, menu))?.label ?? null,
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
    };
  }, [onClose]);

  // Portalled to <body>: the header's backdrop blur would otherwise trap this fixed overlay inside it.
  return createPortal(
    <div className="fixed inset-0 z-[70] xl:hidden">
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#04152c]/50 backdrop-blur-sm"
      />
      <motion.nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        initial={reducedMotion ? false : { x: "100%" }}
        animate={{ x: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { x: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_60px_rgba(8,43,89,0.2)]"
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" onClick={onClose} aria-label="MNC Global Connect home">
            <Image src="/logo/MNCGlobalConnectLogo.png" alt="MNC Global Connect" width={2091} height={1221} className="h-11 w-auto" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex size-11 items-center justify-center rounded-xl border border-slate-200 text-[#082b59] transition hover:bg-slate-50"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
          <form action="/opportunities" role="search" className="relative mb-3">
            <label className="sr-only" htmlFor="mobile-search">Search business opportunities</label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="mobile-search"
              name="query"
              placeholder="Search opportunities"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[15px] outline-none transition focus:border-[#148ce0] focus:bg-white focus:ring-4 focus:ring-[#148ce0]/10"
            />
          </form>

          <Link href="/" onClick={onClose} aria-current={pathname === "/" ? "page" : undefined} className="mobile-nav-row">
            <span className="mobile-nav-icon"><Globe2 aria-hidden="true" className="size-[18px]" /></span>
            Home
          </Link>
          {megaMenus.map((menu, index) => {
            const open = expanded === menu.label;
            const Icon = menu.icon;
            const panelId = `mobile-menu-${index}`;
            return (
              <motion.div
                key={menu.label}
                initial={reducedMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + index * 0.035, duration: 0.3 }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setExpanded(open ? null : menu.label)}
                  data-active={isActive(pathname, menu) || undefined}
                  className="mobile-nav-row w-full"
                >
                  <span className="mobile-nav-icon"><Icon aria-hidden="true" className="size-[18px]" /></span>
                  <span className="flex-1 text-left">{menu.label}</span>
                  <ChevronDown aria-hidden="true" className={`size-4 text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-[#148ce0]" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={panelId}
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mb-2 ml-[27px] grid gap-0.5 border-l-2 border-[#e6f1fa] pl-5">
                        {menu.columns.flatMap((column) => column.links).map((link) => (
                          <Link
                            key={`${menu.label}-${link.label}`}
                            href={link.href}
                            onClick={onClose}
                            className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-600 transition hover:bg-[#f2f8fc] hover:text-[#0878c7]"
                          >
                            {link.label}
                          </Link>
                        ))}
                        <Link href={menu.href} onClick={onClose} className="inline-flex items-center gap-1 px-3 py-2 text-[13px] font-bold text-[#0878c7]">
                          Explore {menu.label} <ArrowRight aria-hidden="true" className="size-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          <Link href="/contact" onClick={onClose} aria-current={pathname.startsWith("/contact") ? "page" : undefined} className="mobile-nav-row">
            <span className="mobile-nav-icon"><Mail aria-hidden="true" className="size-[18px]" /></span>
            Contact
          </Link>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            href="/login"
            onClick={onClose}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 text-[14px] font-bold text-[#082b59] transition hover:border-[#148ce0]/40 hover:bg-[#f2f8fc]"
          >
            <LogIn aria-hidden="true" className="size-4" /> Login
          </Link>
          <Button href="/join-network" onClick={onClose} className="min-h-12 text-[14px]">
            Join Network
          </Button>
        </div>
      </motion.nav>
    </div>,
    document.body,
  );
}

export function Header() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  // Each overlay remembers the path it was opened on, so navigating closes it.
  const [menuState, setMenuState] = useState<{ label: string; path: string } | null>(null);
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const [searchPath, setSearchPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const openMenu = menuState?.path === pathname ? menuState.label : null;
  const mobileOpen = mobilePath === pathname;
  const searchOpen = searchPath === pathname;
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!openMenu && !searchOpen) return;
    const close = () => {
      setMenuState(null);
      setSearchPath(null);
    };
    const pointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) close();
    };
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", keydown);
    };
  }, [openMenu, searchOpen]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const show = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setSearchPath(null);
    setMenuState({ label, path: pathname });
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenuState(null), 160);
  };
  const closeMenu = () => setMenuState(null);
  const closeMobile = () => {
    setMobilePath(null);
    toggleRef.current?.focus();
  };

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled || undefined}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") scheduleClose(); }}
      className="site-header sticky top-0 z-50 border-b text-[#10213a] backdrop-blur-xl"
    >
      <Container className="site-header-bar flex items-center justify-between gap-5">
        <Link href="/" aria-label="MNC Global Connect home" className="flex shrink-0 items-center">
          <Image
            src="/logo/MNCGlobalConnectLogo.png"
            alt="MNC Global Connect"
            width={2091}
            height={1221}
            priority
            loading="eager"
            className="site-header-logo w-auto"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
          <Link href="/" className="nav-link" aria-current={pathname === "/" ? "page" : undefined} onPointerEnter={scheduleClose}>
            Home
          </Link>
          {megaMenus.map((menu, index) => {
            const open = openMenu === menu.label;
            const panelId = `mega-menu-${index}`;
            return (
              <div key={menu.label} onPointerEnter={(event) => { if (event.pointerType === "mouse") show(menu.label); }}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  data-active={isActive(pathname, menu) || undefined}
                  data-open={open || undefined}
                  onClick={() => (open ? closeMenu() : show(menu.label))}
                  className="nav-link gap-1.5"
                >
                  {menu.label}
                  <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[#148ce0]" : "text-slate-400"}`} />
                </button>
              </div>
            );
          })}
          <Link href="/contact" className="nav-link" aria-current={pathname.startsWith("/contact") ? "page" : undefined} onPointerEnter={scheduleClose}>
            Contact
          </Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search opportunities"}
            aria-expanded={searchOpen}
            onClick={() => { setMenuState(null); setSearchPath(searchOpen ? null : pathname); }}
            className="flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-[#082b59]"
          >
            {searchOpen ? <X aria-hidden="true" className="size-[18px]" /> : <Search aria-hidden="true" className="size-[18px]" />}
          </button>
          <Link
            href="/login"
            aria-current={pathname.startsWith("/login") ? "page" : undefined}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-[#082b59] transition hover:bg-slate-100"
          >
            <LogIn aria-hidden="true" className="size-4" /> Login
          </Link>
          <Button href="/join-network" className="min-h-10 whitespace-nowrap px-5 py-2 text-[13px]">
            Join Network <ArrowRight aria-hidden="true" className="size-3.5" />
          </Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobilePath(pathname)}
          className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#082b59] transition hover:bg-slate-50 xl:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </Container>

      <AnimatePresence>
        {openMenu && (() => {
          const index = megaMenus.findIndex((menu) => menu.label === openMenu);
          return <MegaMenuPanel key={openMenu} menu={megaMenus[index]} id={`mega-menu-${index}`} onNavigate={closeMenu} />;
        })()}
      </AnimatePresence>
      <AnimatePresence>
        {searchOpen && <SearchPanel onClose={() => setSearchPath(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && <MobileNavigation pathname={pathname} onClose={closeMobile} />}
      </AnimatePresence>

      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="brand-gradient pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left"
        />
      )}
    </header>
  );
}
