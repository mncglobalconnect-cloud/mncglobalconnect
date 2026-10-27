import { Download } from "lucide-react";
import type { Metadata } from "next";
import type { Filter } from "mongodb";
import {
  dateTime, EmptyState, FilterBar, PAGE_SIZE, PageHeader, Pagination, Panel, pageNumber, param, searchPattern,
} from "@/components/admin/admin-ui";
import { collections } from "@/lib/db/mongodb";
import type { NewsletterSubscriberRecord } from "@/lib/db/models";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage({ searchParams }: PageProps<"/admin-dashboard/subscribers">) {
  const params = await searchParams;
  const query = param(params.q);
  const page = pageNumber(params.page);
  const pattern = searchPattern(query);
  const filter: Filter<NewsletterSubscriberRecord> = pattern ? { email: pattern } : {};
  const { newsletterSubscribers } = await collections();
  const [rows, total] = await Promise.all([
    newsletterSubscribers.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    newsletterSubscribers.countDocuments(filter),
  ]);
  const href = (target: number) => {
    const search = new URLSearchParams({ ...(query ? { q: query } : {}), ...(target > 1 ? { page: String(target) } : {}) });
    return `/admin-dashboard/subscribers${search.size ? `?${search}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="Newsletter sign-ups from the website footer."
        actions={(
          <a href="/api/admin/subscribers/export" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#082b59] px-4 text-[13.5px] font-bold text-white transition hover:bg-[#0b3a75]">
            <Download aria-hidden="true" className="size-4" /> Export CSV
          </a>
        )}
      />
      <FilterBar action="/admin-dashboard/subscribers" query={query} placeholder="Search email" />
      <Panel>
        {rows.length ? (
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-slate-50 text-[11.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">Email</th>
                <th scope="col" className="px-5 py-3">Source</th>
                <th scope="col" className="px-5 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row._id.toString()} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{row.email}</td>
                  <td className="px-5 py-3 capitalize text-slate-600">{row.source}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">{dateTime.format(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState>{query ? "No subscribers match this search." : "No subscribers yet."}</EmptyState>}
        <Pagination page={page} total={total} href={href} />
      </Panel>
    </>
  );
}
