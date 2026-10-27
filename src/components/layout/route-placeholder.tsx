import { ArrowRight, Globe2, Handshake, Mail, UsersRound } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const nextSteps = [
  { icon: UsersRound, title: "Join the network", text: "Apply for membership and build your verified business profile.", href: "/join-network" },
  { icon: Handshake, title: "Request an introduction", text: "Tell us which partners and markets you want to reach.", href: "/international-introductions" },
  { icon: Mail, title: "Talk to our team", text: "Questions about this service? We are happy to help.", href: "/contact" },
];

export function RoutePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SiteShell>
      <main id="main-content">
        <PageHero
          eyebrow="MNC Global Connect"
          crumb={title}
          title={title}
          description={description}
          actions={
            <>
              <Button href="/join-network">
                Join Global Network <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button href="/contact" variant="secondary">
                Talk to our team
              </Button>
            </>
          }
        />
        <section className="bg-[#f4f8fc] pb-20 sm:pb-28">
          <Container>
            <Reveal className="relative z-10 -mt-20 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(8,43,89,0.08)]">
              <div className="grid lg:grid-cols-[1fr_1.4fr]">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#eef6fd] to-[#f3fbf7] p-8 sm:p-10">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#148ce0] shadow-[0_10px_24px_rgba(20,140,224,0.15)]">
                    <Globe2 aria-hidden="true" className="size-7" />
                  </span>
                  <h2 className="mt-6 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#082b59]">
                    A more connected way to do business.
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                    Full details for this service are being prepared. In the meantime, our team can guide you directly.
                  </p>
                  <p className="mt-6 text-[12.5px] leading-relaxed text-slate-500">
                    We facilitate relevant introductions and international business connections. Outcomes depend on the
                    businesses involved.
                  </p>
                </div>
                <ul className="grid divide-y divide-slate-100">
                  {nextSteps.map(({ icon: Icon, title: stepTitle, text, href }) => (
                    <li key={stepTitle}>
                      <Link href={href} className="group flex items-center gap-5 p-6 transition hover:bg-[#f7fbfe] sm:px-8">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#148ce0]/[0.08] text-[#148ce0] transition group-hover:bg-[#148ce0] group-hover:text-white">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-bold text-[#082b59]">{stepTitle}</span>
                          <span className="mt-1 block text-[14px] text-slate-500">{text}</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#148ce0]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
    </SiteShell>
  );
}
