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
  const delayChildren = prefersReducedMotion ? 0 : 0.54;
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
      className="relative isolate overflow-hidden bg-[#f4f8fc] py-[76px] sm:py-[96px]"
    >
      <div aria-hidden="true" className="services-backdrop pointer-events-none absolute inset-0 -z-10" />
      <Container>
        <motion.div variants={revealVariants} className="mb-10 max-w-2xl lg:mb-12">
          <p className="section-eyebrow">Our core services</p>
          <h2 className="section-title mt-3 leading-[1.15] [text-rendering:optimizeLegibility]">
            Everything you need to
            <br className="hidden sm:block" />{" "}
            <span className="brand-text-gradient">grow globally.</span>
          </h2>
        </motion.div>
        <motion.ul
          variants={gridVariants}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5"
        >
          {services.map(({ icon: Icon, title, description, href, image }) => (
            <motion.li key={title} variants={revealVariants} className="h-full">
              <Link
                href={href}
                className="group relative isolate grid h-full min-h-[220px] grid-cols-[minmax(0,1fr)_30%] overflow-hidden rounded-[20px] border border-[#e3ebf4] bg-white shadow-[0_6px_22px_rgba(16,33,58,0.06)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#c8def0] hover:shadow-[0_18px_40px_rgba(16,33,58,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#148ce0]/60"
              >
                <span aria-hidden="true" className="service-card-image relative col-start-2 row-start-1 overflow-hidden">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 30vw, (max-width: 1279px) 15vw, 150px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </span>
                <span className="col-start-1 row-start-1 flex flex-col items-start gap-4 py-6 pl-6 pr-3 sm:pl-7">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#eaf4fc] text-[#148ce0] transition-colors duration-300 group-hover:bg-[#148ce0] group-hover:text-white">
                    <Icon aria-hidden="true" className="size-[22px]" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-bold leading-snug tracking-[-0.01em] text-[#0b2347] sm:text-[18px]">
                      {title}
                    </span>
                    <span className="mt-2 block text-[13.5px] leading-[1.65] text-[#43566e]">
                      {description}
                    </span>
                  </span>
                </span>
                <span className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-white text-[#148ce0] shadow-[0_6px_18px_rgba(8,43,89,0.18)] transition-colors duration-300 group-hover:bg-[#148ce0] group-hover:text-white">
                  <ArrowRight
                    aria-hidden="true"
                    className="size-[18px] transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </motion.section>
  );
}
