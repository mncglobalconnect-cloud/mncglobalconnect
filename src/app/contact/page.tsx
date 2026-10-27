import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Globe2, Handshake, HelpCircle, UsersRound } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/layout/page-hero";
import { SiteShell } from "@/components/layout/site-shell";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Contact MNC Global Connect",
  description: "Contact our team about membership, business introductions, B2B meetings, delegations, events or market access.",
};

const shortcuts = [
  { icon: UsersRound, title: "Become a member", text: "Explore plans and apply to join the network.", href: "/join-network" },
  { icon: Globe2, title: "Request an introduction", text: "Tell us who you want to meet in which market.", href: "/international-introductions" },
  { icon: Handshake, title: "Book B2B meetings", text: "Structured one-to-one meetings with relevant partners.", href: "/b2b-meetings" },
  { icon: CalendarDays, title: "Events & delegations", text: "Join networking events and trade missions.", href: "/events" },
];

const steps = [
  { title: "We review your enquiry", text: "Our team reads every message and routes it to the right specialist." },
  { title: "We get back to you", text: "You hear from us by email with answers or a few follow-up questions." },
  { title: "We help you connect", text: "Where relevant, we suggest introductions, meetings or programmes." },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <PageHero
          eyebrow="Contact us"
          title={<>Let&apos;s start a global <span className="brand-text-gradient">business conversation.</span></>}
          description="Questions about membership, introductions, B2B meetings, delegations, events or market access? Send us a message and the right person on our team will follow up."
        />
        <section className="relative bg-[#f4f8fc] pb-20 pt-12 sm:pb-28">
          <Container className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
            <Reveal className="relative z-10 -mt-28 sm:-mt-32">
              <ContactForm />
            </Reveal>
            <div className="grid content-start gap-8">
              <Reveal delay={0.1}>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#148ce0]">Looking for something specific?</h2>
                <ul className="mt-5 grid gap-3">
                  {shortcuts.map(({ icon: Icon, title, text, href }) => (
                    <li key={title}>
                      <Link href={href} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#148ce0]/30 hover:shadow-[0_14px_34px_rgba(8,43,89,0.08)]">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0] transition group-hover:bg-[#148ce0] group-hover:text-white">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-bold text-[#082b59]">{title}</span>
                          <span className="mt-0.5 block text-[13px] text-slate-500">{text}</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#148ce0]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.15} className="rounded-3xl bg-[#082b59] p-7 text-white">
                <h2 className="text-[19px] font-bold">What happens next</h2>
                <ol className="mt-6 grid gap-6">
                  {steps.map(({ title, text }, index) => (
                    <li key={title} className="flex gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-bold text-[#7ef2c3]">{index + 1}</span>
                      <span>
                        <span className="block text-[15px] font-bold">{title}</span>
                        <span className="mt-1 block text-[13.5px] leading-relaxed text-white/65">{text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Reveal>
              <Reveal delay={0.2}>
                <Link href="/resources" className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4 text-[14px] text-slate-600 transition hover:border-[#148ce0]/50 hover:text-[#082b59]">
                  <HelpCircle aria-hidden="true" className="size-5 text-[#148ce0]" />
                  <span>Have a general question? <strong className="font-bold text-[#082b59]">Browse resources & FAQs</strong></span>
                </Link>
              </Reveal>
            </div>
          </Container>
        </section>
      </main>
    </SiteShell>
  );
}
