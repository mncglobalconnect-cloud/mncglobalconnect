import type { Metadata } from "next";
import type { Filter } from "mongodb";
import Link from "next/link";
import { MemberActions } from "@/components/admin/admin-actions";
import {
  dateOnly, dateTime, EmptyState, FilterBar, PAGE_SIZE, PageHeader, Pagination, Panel, StatusBadge, pageNumber, param, searchPattern,
} from "@/components/admin/admin-ui";
import { collections } from "@/lib/db/mongodb";
import type { UserRecord } from "@/lib/db/models";
import { getAdmin } from "@/lib/server/admin";

export const metadata: Metadata = { title: "Members" };

const statuses = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "disabled", label: "Disabled" },
];

export default async function MembersPage({ searchParams }: PageProps<"/admin-dashboard/members">) {
  const params = await searchParams;
  const status = statuses.some((option) => option.value === param(params.status)) ? param(params.status) : "";
  const query = param(params.q);
  const page = pageNumber(params.page);
  const pattern = searchPattern(query);
  const admin = await getAdmin();

  const filter: Filter<UserRecord> = {
    ...(status ? { status: status as UserRecord["status"] } : {}),
    ...(pattern ? { $or: [{ name: pattern }, { email: pattern }, { company: pattern }] } : {}),
  };
  const { users, applications } = await collections();
  const [rows, total] = await Promise.all([
    users.find(filter, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    users.countDocuments(filter),
  ]);
  const applicationIds = rows.flatMap((user) => (user.applicationId ? [user.applicationId] : []));
  const references = new Map(
    (await applications.find({ _id: { $in: applicationIds } }, { projection: { reference: 1 } }).toArray())
      .map((app) => [app._id.toString(), app.reference]),
  );
  const href = (target: number) => {
    const search = new URLSearchParams({ ...(status ? { status } : {}), ...(query ? { q: query } : {}), ...(target > 1 ? { page: String(target) } : {}) });
    return `/admin-dashboard/members${search.size ? `?${search}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Members" description="Accounts created when applications are approved. Invited members have not set a password yet." />
      <FilterBar action="/admin-dashboard/members" query={query} placeholder="Search name, email or company"
        filters={{ name: "status", options: statuses }} current={status} />
      <Panel>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[13.5px]">
              <thead className="bg-slate-50 text-[11.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Member</th>
                  <th scope="col" className="px-5 py-3">Company</th>
                  <th scope="col" className="px-5 py-3">Application</th>
                  <th scope="col" className="px-5 py-3">Last sign-in</th>
                  <th scope="col" className="px-5 py-3">Joined</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((user) => {
                  const reference = user.applicationId && references.get(user.applicationId.toString());
                  const locked = user.lockedUntil && user.lockedUntil > new Date();
                  return (
                    <tr key={user._id.toString()} className="align-top transition hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-[12.5px] text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{user.company || "—"}</td>
                      <td className="px-5 py-3.5">
                        {reference ? <Link href={`/admin-dashboard/applications/${reference}`} className="font-mono font-semibold text-[#0878c7] hover:underline">{reference}</Link> : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                        {user.lastLoginAt ? dateTime.format(user.lastLoginAt) : "Never"}
                        {locked && <span className="mt-0.5 block text-[12px] font-semibold text-rose-600">Locked (failed sign-ins)</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{dateOnly.format(user.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1"><StatusBadge status={user.status} />{user.role === "admin" && <StatusBadge status="admin" />}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <MemberActions id={user._id.toString()} status={user.status} isSelf={admin?._id.equals(user._id) ?? false} locked={Boolean(locked)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>{query || status ? "No members match these filters." : "No members yet. Approve an application to create the first account."}</EmptyState>}
        <Pagination page={page} total={total} href={href} />
      </Panel>
    </>
  );
}
