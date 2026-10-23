import { ArrowRight, Globe2 } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

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
        <section className="bg-[#061f40] py-24 text-white sm:py-32">
          <Container>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#20b7d5]">
              MNC Global Connect
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/join-network">
                Join Global Network <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button href="/contact" variant="secondary">
                Talk to our team
              </Button>
            </div>
          </Container>
        </section>
        <section className="py-16">
          <Container>
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-white px-6 py-12 text-center">
              <Globe2 aria-hidden="true" className="mb-5 size-9 text-[var(--blue)]" />
              <h2 className="text-xl font-semibold text-[var(--navy)]">
                A more connected way to do business
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                We facilitate relevant introductions and international business
                connections. Outcomes depend on the businesses involved.
              </p>
            </div>
          </Container>
        </section>
      </main>
    </SiteShell>
  );
}
