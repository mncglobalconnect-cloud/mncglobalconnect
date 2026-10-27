import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ReviewActions } from "@/components/admin/admin-actions";
import { dateTime, Panel, StatusBadge } from "@/components/admin/admin-ui";
import { formatMembershipPrice, membershipPlans } from "@/data/membership";
import { getVerificationProfile } from "@/data/membership-verification";
import { collections } from "@/lib/db/mongodb";

export async function generateMetadata({ params }: PageProps<"/admin-dashboard/applications/[reference]">): Promise<Metadata> {
  return { title: `Application ${(await params).reference}` };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel className="p-5">
      <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">{title}</h2>
      <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">{children}</dl>
    </Panel>
  );
}

function Field({ label, value, wide }: { label: string; value?: ReactNode; wide?: boolean }) {
  const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[12px] font-semibold text-slate-500">{label}</dt>
      <dd className={`mt-0.5 text-[14px] ${empty ? "text-slate-400" : "text-slate-800"}`}>{empty ? "—" : value}</dd>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return items.length ? (
    <span className="flex flex-wrap gap-1.5">{items.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12.5px] font-medium text-slate-700">{item}</span>)}</span>
  ) : undefined;
}

export default async function ApplicationDetailPage({ params }: PageProps<"/admin-dashboard/applications/[reference]">) {
  const reference = (await params).reference.toUpperCase();
  const { applications, users } = await collections();
  const app = await applications.findOne({ reference });
  if (!app) notFound();
  const member = app.userId ? await users.findOne({ _id: app.userId }, { projection: { passwordHash: 0 } }) : null;
  const plan = membershipPlans[app.membership.region].find((item) => item.id === app.membership.plan);
  const { personal, business, address, verification, networking, referral } = app.details;
  const profile = getVerificationProfile(address.country);
  const website = business.website ? (/^https?:\/\//i.test(business.website) ? business.website : `https://${business.website}`) : "";

  return (
    <>
      <Link href="/admin-dashboard/applications" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-[#082b59]">
        <ArrowLeft aria-hidden="true" className="size-4" /> All applications
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#082b59]">{business.company}</h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="mt-1 text-[14px] text-slate-500">
            <span className="font-mono font-semibold text-slate-700">{app.reference}</span> · submitted {dateTime.format(app.createdAt)}
            {app.reviewedAt && <> · reviewed {dateTime.format(app.reviewedAt)}</>}
          </p>
        </div>
        {app.status === "submitted" && <div className="w-full max-w-xl sm:w-auto"><ReviewActions reference={app.reference} /></div>}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid min-w-0 content-start gap-5">
          <Section title="Applicant">
            <Field label="Full name" value={personal.fullName} />
            <Field label="Job title" value={personal.designation} />
            <Field label="Business email" value={<a href={`mailto:${personal.email}`} className="text-[#0878c7] hover:underline">{personal.email}</a>} />
            <Field label="Mobile / WhatsApp" value={`${personal.dialCode} ${personal.mobile}`} />
            <Field label="Country of residence" value={personal.residence} />
          </Section>
          <Section title="Business profile">
            <Field label="Company" value={business.company} />
            <Field label="Brand / trade name" value={business.brand} />
            <Field label="Business type" value={business.type} />
            <Field label="Industry" value={business.industry} />
            <Field label="Category" value={[business.category, business.subCategory].filter(Boolean).join(" / ")} />
            <Field label="Established" value={business.established} />
            <Field label="Employees" value={business.employees} />
            <Field label="Website" value={website && <a href={website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-[#0878c7] hover:underline">{business.website}<ExternalLink aria-hidden="true" className="size-3" /></a>} />
            <Field label="About the business" value={business.description} wide />
          </Section>
          <Section title="Location">
            <Field label="Street address" value={[address.line1, address.line2].filter(Boolean).join(", ")} wide />
            <Field label="City" value={address.city} />
            <Field label="State / province" value={address.state} />
            <Field label="Country" value={address.country} />
            <Field label="Postal code" value={address.postalCode} />
          </Section>
          <Section title={`Registrations (${address.country})`}>
            {profile.fields.map(({ key, label }) => <Field key={key} label={label} value={verification[key] && <span className="font-mono">{verification[key]}</span>} />)}
          </Section>
          <Section title="Networking interests">
            <Field label="How they do business" value={<Chips items={networking.roles} />} wide />
            <Field label="Looking for" value={<Chips items={networking.interests} />} wide />
            <Field label="Target markets" value={<Chips items={networking.targetRegions} />} wide />
          </Section>
        </div>

        <div className="grid min-w-0 content-start gap-5">
          <Panel className="p-5">
            <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">Membership</h2>
            <p className="text-[17px] font-bold text-[#082b59]">{plan?.name}</p>
            <p className="text-[14px] text-slate-600">{plan && formatMembershipPrice(plan)} / year · {app.membership.region === "india" ? "India billing" : "Global billing"}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Referral member ID" value={referral.sponsorId} />
              <Field label="Coupon code" value={referral.coupon} />
            </dl>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">Documents ({app.documents.length})</h2>
            {app.documents.length ? (
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
                {app.documents.map((doc) => {
                  const id = doc.fileId.toString();
                  return (
                    <li key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#148ce0]/[0.08] text-[#148ce0]"><FileText aria-hidden="true" className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-slate-800">{doc.kind}</p>
                        <p className="truncate text-[12px] text-slate-500">{doc.name} · {Math.max(1, Math.round(doc.size / 1024))} KB</p>
                      </div>
                      <a href={`/api/admin/documents/${id}`} target="_blank" rel="noreferrer" className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[#0878c7] hover:bg-slate-50">View</a>
                      <a href={`/api/admin/documents/${id}?download`} aria-label={`Download ${doc.kind}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#082b59]"><Download aria-hidden="true" className="size-4" /></a>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="text-[13.5px] text-slate-500">No documents attached.</p>}
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">Declarations</h2>
            <ul className="grid gap-1.5 text-[13.5px] text-slate-700">
              {([["accurate", "Information is accurate"], ["terms", "Terms of Membership"], ["privacy", "Privacy Policy"], ["conduct", "Code of Conduct"], ["marketing", "Marketing updates (optional)"]] as const).map(([key, label]) => (
                <li key={key} className="flex justify-between"><span>{label}</span><span className={app.consent[key] ? "font-semibold text-emerald-700" : "text-slate-400"}>{app.consent[key] ? "Yes" : "No"}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-slate-400">Accepted {dateTime.format(app.consent.acceptedAt)}</p>
          </Panel>

          {member && (
            <Panel className="p-5">
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">Member account</h2>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">{member.email}</p>
                  <p className="text-[12.5px] text-slate-500">{member.lastLoginAt ? `Last sign-in ${dateTime.format(member.lastLoginAt)}` : "Has not signed in yet"}</p>
                </div>
                <StatusBadge status={member.status} />
              </div>
              <Link href={`/admin-dashboard/members?q=${encodeURIComponent(member.email)}`} className="mt-3 inline-block text-[13px] font-semibold text-[#0878c7] hover:underline">Manage account →</Link>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
