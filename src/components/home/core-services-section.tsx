"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Globe2,
  Handshake,
  Network,
  PackageCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const services = [
  {
    number: "01",
    icon: Network,
    title: "Business Networking",
    description:
      "Build relevant relationships across local and international markets.",
    href: "/network",
    image: "/images/events/networking.jpg",
    alt: "Professionals connecting at a business networking event",
    imagePosition: "center 42%",
  },
  {
    number: "02",
    icon: BriefcaseBusiness,
    title: "Business Opportunities",
    description: "Explore buyer needs, supplier leads and partnerships.",
    href: "/opportunities",
    image: "/images/events/buyer-seller.jpg",
    alt: "Business performance dashboard with growth and opportunity metrics",
    imagePosition: "center 45%",
  },
  {
    number: "03",
    icon: CalendarDays,
    title: "Events & Delegations",
    description: "Meet people and explore markets through business programmes.",
    href: "/events",
    image: "/images/events/webinar.jpg",
    alt: "Business speaker presenting to attendees at a professional event",
    imagePosition: "center 48%",
  },
  {
    number: "04",
    icon: Handshake,
    title: "B2B Meetings",
    description: "Move from relevant requirements to focused conversations.",
    href: "/b2b-meetings",
    image: "/images/events/delegation.jpg",
    alt: "Business delegates reviewing information together at a meeting",
    imagePosition: "center 48%",
  },
  {
    number: "05",
    icon: Globe2,
    title: "Global Market Access",
    description: "Find the right connections to support your market exploration.",
    href: "/market-access",
    image: "/images/opportunities/manufacturing-floor.jpg",
    alt: "Modern manufacturing facility representing international industry",
    imagePosition: "center 48%",
  },
  {
    number: "06",
    icon: PackageCheck,
    title: "Tenders & Trade Leads",
    description: "Discover cross-border trade and project opportunities.",
    href: "/trade-opportunities",
    image: "/images/opportunities/construction-materials.jpg",
    alt: "Active construction project with materials and workers on site",
    imagePosition: "center 48%",
  },
];

export function CoreServicesSection() {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.42;
  const delayChildren = prefersReducedMotion ? 0 : 0.3;
  const staggerChildren = prefersReducedMotion ? 0 : 0.05;

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
      viewport={{ once: true, amount: 0.16 }}
      className="relative isolate overflow-hidden bg-[linear-gradient(125deg,#f1f7fc_0%,#ffffff_48%,#edf6fb_100%)] py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_35%,rgba(20,140,224,0.07),transparent_44%),radial-gradient(ellipse_at_12%_82%,rgba(32,183,213,0.045),transparent_38%)]"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 top-8 -z-10 h-[520px] w-[760px] max-w-[86vw] opacity-[0.13] sm:top-0 sm:h-[680px] sm:w-[980px]"
        viewBox="0 0 980 680"
        fill="none"
      >
        <circle cx="630" cy="330" r="230" stroke="#87bdd9" strokeWidth="1.2" />
        <ellipse cx="630" cy="330" rx="94" ry="230" stroke="#87bdd9" strokeWidth="1.2" />
        <ellipse cx="630" cy="330" rx="174" ry="230" stroke="#87bdd9" strokeWidth="1.2" />
        <path
          d="M400 330h460M423 245h414M423 415h414M475 162c91 51 218 51 310 0M475 498c91-51 218-51 310 0"
          stroke="#87bdd9"
          strokeWidth="1.2"
        />
        <path
          d="M260 395c90-124 169-155 263-101s166 81 265-51"
          stroke="#148ce0"
          strokeWidth="1.7"
          strokeDasharray="4 9"
        />
        <path
          d="M381 524c87-121 194-161 300-113 77 35 132 28 216-68"
          stroke="#20b7d5"
          strokeWidth="1.5"
          strokeDasharray="3 9"
        />
        <path
          d="M451 303c73-46 127-47 192-12 60 33 120 31 182-8M462 369c68 35 127 39 194 7 70-34 121-29 177 7"
          stroke="#9bc5db"
          strokeWidth="1"
        />
        <circle cx="260" cy="395" r="6" fill="#35be84" />
        <circle cx="523" cy="294" r="5" fill="#148ce0" />
        <circle cx="788" cy="243" r="6" fill="#20b7d5" />
        <circle cx="381" cy="524" r="5" fill="#148ce0" />
        <circle cx="897" cy="343" r="6" fill="#35be84" />
        <circle cx="260" cy="395" r="14" stroke="#35be84" strokeOpacity=".42" />
        <circle cx="788" cy="243" r="13" stroke="#20b7d5" strokeOpacity=".45" />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 left-[4%] -z-10 size-28 rounded-full bg-[#d7edf7]/50 blur-3xl"
      />

      <Container>
        <motion.div variants={revealVariants} className="mb-9 max-w-3xl sm:mb-11">
          <p className="section-eyebrow">A platform built for business</p>
          <h2 className="section-title mt-3 text-[clamp(2rem,4.4vw,3.55rem)] leading-[1.12] tracking-[-0.035em]">
            Everything you need to
            <br className="hidden sm:block" />{" "}
            <span className="brand-text-gradient">grow globally.</span>
          </h2>
          <p className="mt-5 max-w-[650px] text-sm leading-7 text-[#5f7186] sm:text-base sm:leading-8">
            Connect with businesses, discover opportunities, access global
            markets and build meaningful partnerships from one integrated
            platform.
          </p>
        </motion.div>

        <motion.div
          variants={gridVariants}
          className="grid gap-5 sm:grid-cols-2 sm:gap-5 min-[1200px]:grid-cols-3 min-[1200px]:gap-6"
        >
          {services.map(
            ({
              number,
              icon: Icon,
              title,
              description,
              href,
              image,
              alt,
              imagePosition,
            }) => (
              <motion.div key={title} variants={revealVariants} className="h-full">
                <Link
                  href={href}
                  className="group relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-[22px] border border-[#e1eaf2] bg-white/95 shadow-[0_6px_24px_rgba(16,33,58,0.045)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-[5px] hover:border-[#c0dcec] hover:shadow-[0_18px_38px_rgba(16,51,82,0.1)] focus-visible:border-[#92c8e8] focus-visible:shadow-[0_10px_28px_rgba(20,140,224,0.15)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-4 z-10 text-[11px] font-semibold tracking-[0.14em] text-white/90 drop-shadow-[0_1px_4px_rgba(8,43,89,0.7)]"
                  >
                    {number}
                  </span>
                  <span className="relative block h-[180px] shrink-0 overflow-hidden bg-[#eaf2f8] sm:h-[190px]">
                    <Image
                      src={image}
                      alt={alt}
                      fill
                      sizes="(min-width: 1200px) 390px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.035]"
                      style={{ objectPosition: imagePosition }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#082b59]/25 via-transparent to-[#082b59]/10"
                    />
                  </span>
                  <span className="flex flex-1 items-start gap-3 px-5 pb-5 pt-[18px] sm:px-6 sm:pb-6">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eff6fb] text-[#148ce0] transition-colors duration-300 group-hover:bg-[#e4f2f9] group-hover:text-[#0878c7]">
                      <Icon aria-hidden="true" className="size-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold tracking-[-0.01em] text-[#102b4c]">
                        {title}
                      </span>
                      <span className="mt-2 block text-[13px] leading-[1.7] text-[#65768b] sm:text-[13.5px]">
                        {description}
                      </span>
                    </span>
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#e4edf4] bg-white text-[#5684a4] transition-[transform,border-color,background-color,color] duration-300 group-hover:translate-x-1 group-hover:border-[#c7e2ef] group-hover:bg-[#f1f8fc] group-hover:text-[#0878c7]">
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </span>
                  </span>
                </Link>
              </motion.div>
            ),
          )}
        </motion.div>
      </Container>
    </motion.section>
  );
}
