import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, Building2, CalendarDays, FileCheck2, Globe2, Handshake, Mail, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHero } from "@/components/layout/page-hero";
import { SiteShell } from "@/components/layout/site-shell";
import { Container } from "@/components/ui/container";
import { formatMembershipPrice, membershipPlans } from "@/data/membership";
import { collections } from "@/lib/db/mongodb";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Member Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const shortcuts = [
  { icon: Sparkles, title: "Opportunities", text: "Buyer requirements and trade leads", href: "/opportunities" },
  { icon: Handshake, title: "B2B meetings", text: "Request structured meetings", href: "/b2b-meetings" },
  { icon: Globe2, title: "Introductions", text: "Reach partners in new markets", href: "/international-introductions" },
  { icon: CalendarDays, title: "Events", text: "Networking events and delegations", href: "/events" },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { applications } = await collections();
  const application = user.applicationId ? await applications.findOne({ _id: user.applicationId }) : null;
  const plan = application ? membershipPlans[application.membership.region].find((item) => item.id === application.membership.plan) : null;
  const firstName = user.name.split(" ")[0];

  return (
    <SiteShell>
      <main id="main-content">
        <PageHero
          eyebrow="Member dashboard"
          crumb="Dashboard"
          title={<>Welcome back, <span className="brand-text-gradient">{firstName}.</span></>}
          description={`Signed in as ${user.email}${user.company ? ` · ${user.company}` : ""}.`}
          actions={<SignOutButton />}
        />
        <section className="bg-[#f4f8fc] pb-20 sm:pb-28">
          <Container className="relative z-10 -mt-24 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-[26px] border border-slate-200/80 bg-white p-7 shadow-[0_24px_60px_rgba(8,43,89,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[20px] font-bold text-[#082b59]">Your membership</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#35be84]/12 px-3 py-1 text-[12.5px] font-bold text-[#218864]">
                  <BadgeCheck aria-hidden="true" className="size-4" /> Approved member
                </span>
              </div>
              {application && plan ? (
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {[
                    { icon: Sparkles, label: "Plan", value: `${plan.name} · ${formatMembershipPrice(plan)} / year` },
                    { icon: FileCheck2, label: "Application reference", value: application.reference },
                    { icon: Building2, label: "Business", value: `${application.details.business.company} · ${application.details.business.industry}` },
                    { icon: MapPin, label: "Location", value: [application.details.address.city, application.details.address.country].filter(Boolean).join(", ") },
                    { icon: Mail, label: "Contact", value: `${application.details.personal.dialCode} ${application.details.personal.mobile}` },
                    { icon: CalendarDays, label: "Member since", value: dateFormat.format(application.reviewedAt ?? user.createdAt) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0]">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <div>
                        <dt className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</dt>
                        <dd className="mt-0.5 text-[14.5px] font-semibold text-[#10213a]">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-5 text-[14.5px] text-slate-500">Your account is active. Membership details will appear here once linked to your application.</p>
              )}
              {application && application.documents.length > 0 && (
                <div className="mt-7 border-t border-slate-100 pt-5">
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">Documents on file</h3>
                  <ul className="mt-3 grid gap-2">
                    {application.documents.map((doc) => (
                      <li key={doc.kind} className="flex items-center gap-2 text-[14px] text-slate-700">
                        <FileCheck2 aria-hidden="true" className="size-4 text-[#218864]" /> {doc.kind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="grid content-start gap-3">
              {shortcuts.map(({ icon: Icon, title, text, href }) => (
                <Link key={title} href={href} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#148ce0]/30 hover:shadow-[0_14px_34px_rgba(8,43,89,0.08)]">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0] transition group-hover:bg-[#148ce0] group-hover:text-white">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold text-[#082b59]">{title}</span>
                    <span className="block text-[13px] text-slate-500">{text}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </SiteShell>
  );
}
