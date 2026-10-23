import {
  ArrowRight,
  BadgeCheck,
  Compass,
  Globe2,
  Handshake,
  SearchCheck,
  UsersRound,
  Workflow,
} from "lucide-react";
import { Container } from "@/components/ui/container";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore global markets, businesses and relevant opportunities.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Connect",
    description: "Build qualified connections with relevant businesses.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Match",
    description: "Identify relevant businesses for your requirement.",
    icon: SearchCheck,
  },
  {
    number: "04",
    title: "Meet",
    description: "Engage through B2B and buyer-seller meetings.",
    icon: Handshake,
  },
  {
    number: "05",
    title: "Collaborate",
    description: "Explore partnerships, distribution or business plans.",
    icon: Workflow,
  },
  {
    number: "06",
    title: "Execute",
    description: "Move conversations toward practical next steps.",
    icon: BadgeCheck,
  },
  {
    number: "07",
    title: "Grow Globally",
    description: "Develop long-term international relationships.",
    icon: Globe2,
  },
];

export function BusinessJourneySection() {
  return (
    <section className="overflow-hidden bg-[#f3f8fc] py-[76px] sm:py-[90px]">
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="section-eyebrow">A clear path to progress</p>
          <h2 className="section-title mt-3">
            From connection to
            <br className="hidden sm:block" />{" "}
            <span className="brand-text-gradient">business growth.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#66778d] sm:text-[15px]">
            From introduction to opportunity, we help businesses build
            meaningful relationships and work toward business outcomes.
          </p>
        </div>
        <div className="relative">
          <div className="journey-line absolute left-[7%] right-[7%] top-[29px] hidden h-px lg:block" />
          <div className="absolute bottom-6 left-[28px] top-6 w-px bg-[#dcebf5] sm:hidden" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-7 lg:gap-3">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <li
                key={number}
                className="relative flex items-start gap-4 lg:block"
              >
                <div className="relative z-10 flex size-[58px] shrink-0 items-center justify-center rounded-[18px] border border-[#dcebf5] bg-white text-[#148ce0] shadow-[0_5px_18px_rgba(8,43,89,0.06)] lg:mb-5">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <div className="pt-0.5 lg:pt-0">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-[#148ce0]">
                    {number}
                  </p>
                  <h3 className="mt-1 text-[14px] font-semibold text-[#10213a] lg:mt-1.5">
                    {title}
                  </h3>
                  <p className="mt-1.5 max-w-[240px] text-[11px] leading-[1.7] text-[#718096] lg:mt-2 lg:max-w-[180px]">
                    {description}
                  </p>
                </div>
                {number !== "07" && (
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute right-5 top-[21px] size-4 text-[#8fc0df] lg:hidden"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-9 text-[10px] font-bold tracking-[0.22em] text-[#617087]">
          CONNECT <span className="mx-2 text-[#20b7d5]">—</span> COLLABORATE{" "}
          <span className="mx-2 text-[#20b7d5]">—</span> GROW
        </p>
      </Container>
    </section>
  );
}
