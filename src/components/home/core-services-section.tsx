"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Handshake,
  Network,
  PackageCheck,
  RadioTower,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const services = [
  {
    icon: Network,
    title: "Business Networking",
    description: "Connect with verified business owners, industry communities and decision-makers across domestic and international markets.",
    href: "/network",
    image: "/images/services/networking-handshake.webp",
  },
  {
    icon: BriefcaseBusiness,
    title: "Business Opportunities",
    description: "Discover buyer requirements, supplier leads, joint ventures and partnership offers shared by members worldwide.",
    href: "/opportunities",
    image: "/images/services/opportunities-port.webp",
  },
  {
    icon: CalendarDays,
    title: "Events & Delegations",
    description: "Meet international partners at networking events, business forums, trade missions and delegations.",
    href: "/events",
    image: "/images/services/events-conference.webp",
  },
  {
    icon: Handshake,
    title: "B2B Meetings",
    description: "Turn qualified requirements into structured one-to-one meetings with relevant partners.",
    href: "/b2b-meetings",
    image: "/images/services/b2b-laptop-meeting.webp",
  },
  {
    icon: RadioTower,
    title: "Global Market Access",
    description: "Enter new markets with partner identification, buyer connections and market-entry support.",
    href: "/market-access",
    image: "/images/services/market-access-earth.webp",
  },
  {
    icon: PackageCheck,
    title: "Tenders & Trade Leads",
    description: "Track import, export and cross-border project opportunities matched to your industry.",
    href: "/trade-opportunities",
    image: "/images/services/tenders-signing.webp",
  },
];

export function CoreServicesSection() {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.48;
  const delayChildren = prefersReducedMotion ? 0 : 0.12;
  const staggerChildren = prefersReducedMotion ? 0 : 0.06;

  const sectionVariants = {
    hidden: {},
    visible: {},
  };
  const revealVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: "easeOut" as const },
    },
  };
  const gridVariants = {
    hidden: {},
    visible: {
      transition: { delayChildren, staggerChildren },
    },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionVariants}
      aria-labelledby="core-services-heading"
      className="relative isolate overflow-hidden border-y border-[#e6edf4] bg-[#f6f9fc] py-16 sm:py-20 lg:py-24"
    >
      <div aria-hidden="true" className="services-backdrop pointer-events-none absolute inset-0 -z-10" />
      <Container>
        <motion.div variants={revealVariants} className="mb-9 flex flex-col gap-5 lg:mb-11 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <p className="section-eyebrow flex items-center gap-2.5">
              <span aria-hidden="true" className="h-px w-8 bg-[#148ce0]" />
              Our core services
            </p>
            <h2 id="core-services-heading" className="section-title mt-4 leading-[1.15] [text-rendering:optimizeLegibility]">
              Everything you need to
              <br className="hidden sm:block" />{" "}
              <span className="brand-text-gradient">grow globally.</span>
            </h2>
          </div>
          <p className="max-w-[350px] text-[14px] leading-7 text-[#617087] lg:pb-1">
            From your first connection to your next market, discover the right support for every stage of your business.
          </p>
        </motion.div>
        <motion.ul
          variants={gridVariants}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6"
        >
          {services.map(({ icon: Icon, title, description, href, image }) => (
            <motion.li key={title} variants={revealVariants} className="h-full">
              <Link
                href={href}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#dfe8f1] bg-white shadow-[0_4px_16px_rgba(8,43,89,0.03)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#b6d7ef] hover:shadow-[0_16px_36px_rgba(8,43,89,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#148ce0] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f6f9fc] motion-reduce:transform-none"
              >
                <span aria-hidden="true" className="relative block h-40 shrink-0 overflow-hidden bg-[#e7eff6] sm:h-44">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 50vw, 400px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#061f40]/50 via-[#061f40]/5 to-transparent" />
                  <span className="absolute bottom-4 left-5 flex size-11 items-center justify-center rounded-xl border border-white/40 bg-white/95 text-[#0878c7] shadow-sm backdrop-blur-sm sm:left-6">
                    <Icon className="size-[22px]" strokeWidth={1.7} />
                  </span>
                </span>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-[18px] font-bold leading-snug tracking-[-0.02em] text-[#0b2347] transition-colors group-hover:text-[#0878c7] sm:text-[19px]">
                    {title}
                  </h3>
                  <p className="mb-5 mt-2.5 text-[13.5px] leading-[1.75] text-[#617087]">
                    {description}
                  </p>
                  <span className="mt-auto flex items-center justify-between gap-3 border-t border-[#edf1f5] pt-4 text-[12px] font-semibold text-[#0878c7]">
                    Explore service <span className="sr-only">: {title}</span>
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#edf6fd] text-[#148ce0] transition-colors duration-300 group-hover:bg-[#148ce0] group-hover:text-white group-focus-visible:bg-[#148ce0] group-focus-visible:text-white">
                      <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
                    </span>
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </motion.section>
  );
}
