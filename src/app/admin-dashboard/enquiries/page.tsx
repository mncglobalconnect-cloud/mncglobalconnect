import type { Metadata } from "next";
import type { Filter } from "mongodb";
import { EnquiryStatusButton } from "@/components/admin/admin-actions";
import {
  dateTime, EmptyState, FilterBar, PAGE_SIZE, PageHeader, Pagination, Panel, StatusBadge, pageNumber, param, searchPattern,
} from "@/components/admin/admin-ui";
import { collections } from "@/lib/db/mongodb";
import type { ContactEnquiryRecord } from "@/lib/db/models";

export const metadata: Metadata = { title: "Enquiries" };

const statuses = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "handled", label: "Handled" },
];

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin-dashboard/enquiries">) {
  const params = await searchParams;
  const status = statuses.some((option) => option.value === param(params.status)) ? param(params.status) : "";
  const query = param(params.q);
  const page = pageNumber(params.page);
  const pattern = searchPattern(query);

  const filter: Filter<ContactEnquiryRecord> = {
    ...(status ? { status: status as ContactEnquiryRecord["status"] } : {}),
    ...(pattern ? { $or: [{ name: pattern }, { email: pattern }, { company: pattern }, { topic: pattern }, { message: pattern }] } : {}),
  };
  const { contactEnquiries } = await collections();
  const [rows, total] = await Promise.all([
    contactEnquiries.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    contactEnquiries.countDocuments(filter),
  ]);
  const href = (target: number) => {
    const search = new URLSearchParams({ ...(status ? { status } : {}), ...(query ? { q: query } : {}), ...(target > 1 ? { page: String(target) } : {}) });
    return `/admin-dashboard/enquiries${search.size ? `?${search}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Enquiries" description="Messages sent through the Contact page." />
      <FilterBar action="/admin-dashboard/enquiries" query={query} placeholder="Search name, email, company, topic or message"
        filters={{ name: "status", options: statuses }} current={status} />
      <Panel>
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map((enquiry) => (
              <li key={enquiry._id.toString()} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14.5px] font-bold text-slate-800">{enquiry.name}</p>
                      <StatusBadge status={enquiry.status} />
                      <span className="rounded-full bg-[#148ce0]/[0.08] px-2.5 py-0.5 text-[12px] font-semibold text-[#0878c7]">{enquiry.topic}</span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                      <a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.topic}`)}`} className="text-[#0878c7] hover:underline">{enquiry.email}</a>
                      {enquiry.company && <> · {enquiry.company}</>} · {enquiry.country} · {dateTime.format(enquiry.createdAt)}
                    </p>
                  </div>
                  <EnquiryStatusButton id={enquiry._id.toString()} status={enquiry.status} />
                </div>
                <p className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 p-3.5 text-[13.5px] leading-relaxed text-slate-700">{enquiry.message}</p>
              </li>
            ))}
          </ul>
        ) : <EmptyState>{query || status ? "No enquiries match these filters." : "No enquiries yet."}</EmptyState>}
        <Pagination page={page} total={total} href={href} />
      </Panel>
    </>
  );
}
