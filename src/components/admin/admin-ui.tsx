import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
export const dateOnly = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });
export const PAGE_SIZE = 20;

const badgeTones: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  submitted: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  invited: "bg-sky-50 text-sky-700 ring-sky-200",
  disabled: "bg-slate-100 text-slate-600 ring-slate-200",
  new: "bg-amber-50 text-amber-700 ring-amber-200",
  handled: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  admin: "bg-violet-50 text-violet-700 ring-violet-200",
};
const badgeLabels: Record<string, string> = { submitted: "Pending review", invited: "Invited", new: "New" };

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-bold capitalize ring-1 ring-inset ${badgeTones[status] ?? badgeTones.disabled}`}>
      {badgeLabels[status] ?? status}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#082b59]">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-slate-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_6px_20px_rgba(8,43,89,0.04)] ${className}`}>{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-6 py-14 text-center text-[14px] text-slate-500">{children}</p>;
}

/** GET form for search and filters, so results are linkable and work without JavaScript. */
export function FilterBar({ action, query, placeholder, filters, current }: {
  action: string;
  query: string;
  placeholder: string;
  filters?: { name: string; options: { value: string; label: string }[] };
  current?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {filters && (
        <div className="flex flex-wrap gap-1.5 rounded-full bg-white p-1 ring-1 ring-slate-200">
          {filters.options.map((option) => {
            const params = new URLSearchParams();
            if (option.value) params.set(filters.name, option.value);
            if (query) params.set("q", query);
            const active = (current ?? "") === option.value;
            return (
              <Link key={option.value || "all"} href={`${action}${params.size ? `?${params}` : ""}`}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${active ? "bg-[#082b59] text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                {option.label}
              </Link>
            );
          })}
        </div>
      )}
      <form action={action} className="relative ml-auto w-full max-w-sm sm:w-auto sm:min-w-[300px]">
        {filters && current && <input type="hidden" name={filters.name} value={current} />}
        <label htmlFor="admin-search" className="sr-only">Search</label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input id="admin-search" name="q" defaultValue={query} placeholder={placeholder}
          className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-[14px] outline-none transition focus:border-[#148ce0] focus:ring-4 focus:ring-[#148ce0]/10" />
      </form>
    </div>
  );
}

export function Pagination({ page, total, href }: { page: number; total: number; href: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[13px] text-slate-500">
      <span>Page {page} of {pages} · {total} total</span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"><ChevronLeft aria-hidden="true" className="size-4" /> Previous</Link>}
        {page < pages && <Link href={href(page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">Next <ChevronRight aria-hidden="true" className="size-4" /></Link>}
      </div>
    </div>
  );
}

/** Escapes user text for use inside a MongoDB regex search. */
export function searchPattern(query: string) {
  return query ? new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
}

export function pageNumber(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function param(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? "";
}
