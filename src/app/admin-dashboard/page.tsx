import { ArrowRight, FileText, Inbox, Mail, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { dateTime, PageHeader, Panel, StatusBadge } from "@/components/admin/admin-ui";
import { membershipPlans } from "@/data/membership";
import { collections } from "@/lib/db/mongodb";

export const metadata: Metadata = { title: "Overview" };

/** Start of the rolling seven-day window shown on the overview (evaluated per request). */
function sevenDaysAgo() {
  return new Date(Date.now() - 7 * 24 * 3600 * 1000);
}

export default async function AdminOverviewPage() {
  const { applications, users, contactEnquiries, newsletterSubscribers } = await collections();
  const weekAgo = sevenDaysAgo();
  const [byStatus, byPlan, memberCounts, newEnquiries, subscribers, newThisWeek, recentApplications, recentEnquiries] = await Promise.all([
    applications.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
    applications.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$membership.plan", count: { $sum: 1 } } }]).toArray(),
    users.aggregate<{ _id: string; count: number }>([{ $match: { role: "member" } }, { $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
    contactEnquiries.countDocuments({ status: "new" }),
    newsletterSubscribers.countDocuments(),
    applications.countDocuments({ createdAt: { $gte: weekAgo } }),
    applications.find({}, { projection: { reference: 1, status: 1, applicant: 1, membership: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(6).toArray(),
    contactEnquiries.find({}, { projection: { name: 1, topic: 1, status: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(5).toArray(),
  ]);
  const count = (rows: { _id: string; count: number }[], key: string) => rows.find((row) => row._id === key)?.count ?? 0;
  const totalApplications = byStatus.reduce((sum, row) => sum + row.count, 0);
  const planNames = Object.fromEntries(membershipPlans.india.map((plan) => [plan.id, plan.name]));

  const stats = [
    { label: "Pending applications", value: count(byStatus, "submitted"), detail: `${newThisWeek} received this week`, icon: FileText, href: "/admin-dashboard/applications?status=submitted" },
    { label: "Active members", value: count(memberCounts, "active"), detail: `${count(memberCounts, "invited")} invited, awaiting password`, icon: UsersRound, href: "/admin-dashboard/members" },
    { label: "New enquiries", value: newEnquiries, detail: "Contact form messages to handle", icon: Inbox, href: "/admin-dashboard/enquiries?status=new" },
    { label: "Newsletter subscribers", value: subscribers, detail: "Total sign-ups", icon: Mail, href: "/admin-dashboard/subscribers" },
  ];

  return (
    <>
      <PageHeader title="Overview" description="Applications, members and messages across MNC Global Connect." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, href }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_20px_rgba(8,43,89,0.04)] transition hover:-translate-y-0.5 hover:border-[#148ce0]/30">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0]"><Icon aria-hidden="true" className="size-5" /></span>
              <ArrowRight aria-hidden="true" className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#148ce0]" />
            </div>
            <p className="mt-4 text-[30px] font-bold leading-none tracking-tight text-[#082b59]">{value}</p>
            <p className="mt-2 text-[13.5px] font-semibold text-slate-700">{label}</p>
            <p className="text-[12.5px] text-slate-500">{detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#082b59]">Latest applications</h2>
            <Link href="/admin-dashboard/applications" className="text-[13px] font-semibold text-[#0878c7] hover:text-[#082b59]">View all</Link>
          </div>
          {recentApplications.length ? (
            <ul className="divide-y divide-slate-100">
              {recentApplications.map((app) => (
                <li key={app.reference}>
                  <Link href={`/admin-dashboard/applications/${app.reference}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-slate-800">{app.applicant.company}</p>
                      <p className="truncate text-[12.5px] text-slate-500">{app.applicant.name} · {app.applicant.country} · {planNames[app.membership.plan]}</p>
                    </div>
                    <span className="hidden text-[12.5px] text-slate-400 sm:block">{dateTime.format(app.createdAt)}</span>
                    <StatusBadge status={app.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="px-5 py-10 text-center text-[14px] text-slate-500">No applications yet.</p>}
        </Panel>

        <div className="grid content-start gap-6">
          <Panel className="p-5">
            <h2 className="text-[15px] font-bold text-[#082b59]">Applications by status</h2>
            <div className="mt-4 grid gap-3">
              {(["submitted", "approved", "rejected"] as const).map((status) => {
                const value = count(byStatus, status);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-[13px]"><StatusBadge status={status} /><span className="font-bold text-slate-700">{value}</span></div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="brand-gradient h-full rounded-full" style={{ width: `${totalApplications ? (value / totalApplications) * 100 : 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <h3 className="mt-6 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">By plan</h3>
            <ul className="mt-2 grid gap-1.5 text-[13.5px]">
              {membershipPlans.india.map((plan) => (
                <li key={plan.id} className="flex justify-between"><span className="text-slate-600">{plan.name}</span><span className="font-semibold text-slate-800">{count(byPlan, plan.id)}</span></li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-[15px] font-bold text-[#082b59]">Recent enquiries</h2>
              <Link href="/admin-dashboard/enquiries" className="text-[13px] font-semibold text-[#0878c7] hover:text-[#082b59]">View all</Link>
            </div>
            {recentEnquiries.length ? (
              <ul className="divide-y divide-slate-100">
                {recentEnquiries.map((enquiry) => (
                  <li key={enquiry._id.toString()} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-slate-800">{enquiry.name}</p>
                      <p className="truncate text-[12.5px] text-slate-500">{enquiry.topic}</p>
                    </div>
                    <StatusBadge status={enquiry.status} />
                  </li>
                ))}
              </ul>
            ) : <p className="px-5 py-8 text-center text-[13.5px] text-slate-500">No enquiries yet.</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
