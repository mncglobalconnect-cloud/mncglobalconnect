import type { Metadata } from "next";
import Link from "next/link";
import type { Filter } from "mongodb";
import {
  dateTime, EmptyState, FilterBar, PAGE_SIZE, PageHeader, Pagination, Panel, StatusBadge, pageNumber, param, searchPattern,
} from "@/components/admin/admin-ui";
import { membershipPlans } from "@/data/membership";
import { collections } from "@/lib/db/mongodb";
import type { ApplicationRecord } from "@/lib/db/models";

export const metadata: Metadata = { title: "Applications" };

const statuses = [
  { value: "", label: "All" },
  { value: "submitted", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin-dashboard/applications">) {
  const params = await searchParams;
  const status = statuses.some((option) => option.value === param(params.status)) ? param(params.status) : "";
  const query = param(params.q);
  const page = pageNumber(params.page);
  const pattern = searchPattern(query);

  const filter: Filter<ApplicationRecord> = {
    ...(status ? { status: status as ApplicationRecord["status"] } : {}),
    ...(pattern ? { $or: [{ reference: pattern }, { "applicant.name": pattern }, { "applicant.email": pattern }, { "applicant.company": pattern }, { "applicant.country": pattern }] } : {}),
  };
  const { applications } = await collections();
  const [rows, total] = await Promise.all([
    applications.find(filter, { projection: { details: 0 } }).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    applications.countDocuments(filter),
  ]);
  const planNames = Object.fromEntries(membershipPlans.india.map((plan) => [plan.id, plan.name]));
  const href = (target: number) => {
    const search = new URLSearchParams({ ...(status ? { status } : {}), ...(query ? { q: query } : {}), ...(target > 1 ? { page: String(target) } : {}) });
    return `/admin-dashboard/applications${search.size ? `?${search}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Applications" description="Membership applications submitted through the Join Network form." />
      <FilterBar action="/admin-dashboard/applications" query={query} placeholder="Search reference, name, email, company or country"
        filters={{ name: "status", options: statuses }} current={status} />
      <Panel>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13.5px]">
              <thead className="bg-slate-50 text-[11.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Reference</th>
                  <th scope="col" className="px-5 py-3">Business</th>
                  <th scope="col" className="px-5 py-3">Applicant</th>
                  <th scope="col" className="px-5 py-3">Plan</th>
                  <th scope="col" className="px-5 py-3">Docs</th>
                  <th scope="col" className="px-5 py-3">Submitted</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((app) => (
                  <tr key={app.reference} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin-dashboard/applications/${app.reference}`} className="font-mono font-bold text-[#0878c7] hover:underline">{app.reference}</Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{app.applicant.company}</p>
                      <p className="text-[12.5px] text-slate-500">{app.applicant.country}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700">{app.applicant.name}</p>
                      <p className="text-[12.5px] text-slate-500">{app.applicant.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{planNames[app.membership.plan]}<span className="block text-[12px] text-slate-400">{app.membership.region === "india" ? "India (₹)" : "Global ($)"}</span></td>
                    <td className="px-5 py-3.5 text-slate-700">{app.documents.length}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{dateTime.format(app.createdAt)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>{query || status ? "No applications match these filters." : "No applications yet."}</EmptyState>}
        <Pagination page={page} total={total} href={href} />
      </Panel>
    </>
  );
}
