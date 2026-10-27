import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  /** Plain-text name for the breadcrumb; defaults to the eyebrow. */
  crumb?: string;
  actions?: ReactNode;
};

/** Navy page header used by inner pages: breadcrumb, eyebrow, title and lead text over an animated backdrop. */
export function PageHero({ eyebrow, title, description, crumb, actions }: PageHeroProps) {
  return (
    <section className="page-hero relative isolate overflow-hidden bg-[#061f40] text-white">
      <div aria-hidden="true" className="login-aurora pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="login-grid pointer-events-none absolute inset-0 -z-10" />
      <Container className="relative pb-36 pt-14 sm:pb-40 sm:pt-20">
        <Reveal y={10}>
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/55">
              <li><Link href="/" className="transition hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
              <li aria-current="page" className="text-white/85">{crumb ?? eyebrow}</li>
            </ol>
          </nav>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9eef7]">
            <span className="size-1.5 rounded-full bg-[#35be84]" /> {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-5 max-w-[820px] text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-[680px] text-[16px] leading-[1.75] text-white/70 sm:text-[17px]">{description}</p>
        </Reveal>
        {actions && <Reveal delay={0.22} className="mt-8 flex flex-wrap gap-3">{actions}</Reveal>}
      </Container>
    </section>
  );
}
