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
import Link from "next/link";
import { Container } from "@/components/ui/container";

const services = [
  {
    icon: Network,
    title: "Business Networking",
    description: "Build relevant relationships across international markets.",
    href: "/network",
  },
  {
    icon: BriefcaseBusiness,
    title: "Business Opportunities",
    description: "Explore buyer needs, supplier leads and partnerships.",
    href: "/opportunities",
  },
  {
    icon: CalendarDays,
    title: "Events & Delegations",
    description: "Meet people and explore markets through business programmes.",
    href: "/events",
  },
  {
    icon: Handshake,
    title: "B2B Meetings",
    description: "Move from relevant requirements to focused conversations.",
    href: "/b2b-meetings",
  },
  {
    icon: RadioTower,
    title: "Global Market Access",
    description: "Find the right connections to support your market exploration.",
    href: "/market-access",
  },
  {
    icon: PackageCheck,
    title: "Tenders & Trade Leads",
    description: "Discover cross-border trade and project opportunities.",
    href: "/trade-opportunities",
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
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="relative isolate overflow-hidden bg-[#f5f9fd] py-[72px] sm:py-[84px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(20,140,224,0.045),transparent_58%)]"
      />
      <Container>
        <motion.div variants={revealVariants} className="mb-8 max-w-2xl">
          <p className="section-eyebrow">A platform built for business</p>
          <h2 className="section-title mt-3 leading-[1.2] [text-rendering:optimizeLegibility]">
            Everything you need to
            <br className="hidden sm:block" />{" "}
            <span className="brand-text-gradient">grow globally.</span>
          </h2>
        </motion.div>
        <motion.div
          variants={gridVariants}
          className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {services.map(({ icon: Icon, title, description, href }) => (
            <motion.div
              key={title}
              variants={revealVariants}
              className="h-full"
            >
              <Link
                href={href}
                className="group relative flex min-h-[158px] h-full cursor-pointer items-start gap-4 rounded-[20px] border border-[#e4ebf3] bg-white p-5 shadow-[0_3px_12px_rgba(16,33,58,0.025)] transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out hover:-translate-y-[5px] hover:border-[#c4dff0] hover:bg-[#feffff] hover:shadow-[0_12px_28px_rgba(16,33,58,0.075)] focus-visible:border-[#92c8e8] focus-visible:shadow-[0_8px_24px_rgba(20,140,224,0.12)] sm:p-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#eef5fa] text-[#148ce0] transition-[transform,background-color,color] duration-300 ease-out group-hover:scale-[1.03] group-hover:bg-[#e5f5fb] group-hover:text-[#0878c7]">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[#10213a] transition-colors duration-200 group-hover:text-[#082b59]">
                    {title}
                  </span>
                  <span className="mt-2 block max-w-[290px] text-[12px] leading-[1.65] text-[#718096] transition-colors duration-200 group-hover:text-[#5d6f86]">
                    {description}
                  </span>
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#9aabba] transition-[background-color,color] duration-200 group-hover:bg-[#eff7fc] group-hover:text-[#148ce0]">
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-[5px]"
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </motion.section>
  );
}
