"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { countryCodes } from "@/data/country-codes";
import { opportunityLabels } from "@/lib/listings";
import type { Listing, ListingKind } from "@/types/listing";
import { EmptyState, Panel, StatusBadge } from "@/components/admin/admin-ui";
import { SelectField, Spinner, TextAreaField, TextField } from "@/components/ui/form-controls";

const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[13.5px] font-bold transition disabled:cursor-wait disabled:opacity-60";

export function ListingsManager({ kind, items }: { kind: ListingKind; items: Listing[] }) {
  const router = useRouter();
  const editor = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isEvent = kind === "events";
  const singular = isEvent ? "event" : "opportunity";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/listings/${kind}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(form), published: form.get("published") === "on", ...(editing ? { id: editing.id } : {}) }),
      });
      const result: { ok?: boolean; error?: string } = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "The listing could not be saved. Please try again.");
      setMessage(form.get("published") === "on" ? "Listing published. Its website link opens in a new tab." : "Draft saved. This listing is not visible on the website.");
      setEditing(null);
      setFormKey((key) => key + 1);
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The listing could not be saved. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-7">
      <div ref={editor}>
        <Panel className="p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-[#082b59]">{editing ? `Edit ${singular}` : `Add ${singular}`}</h2>
          <form key={formKey} onSubmit={save}>
            <fieldset disabled={pending} className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><TextField id="title" label="Title" defaultValue={editing?.title} maxLength={180} required /></div>
              {isEvent ? (
                <TextField id="category" label="Event category" placeholder="B2B networking, Webinar, Business delegation..." defaultValue={editing?.category} maxLength={80} required />
              ) : (
                <div>
                  <label htmlFor="category" className="mb-2 block text-[13px] font-semibold text-[#1d3150]">Opportunity category</label>
                  <select id="category" name="category" className="form-control" defaultValue={editing?.category ?? ""} required>
                    <option value="">Select a category</option>
                    {Object.entries(opportunityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              )}
              <TextField id="date" label={isEvent ? "Event date" : "Posted date"} type="date" defaultValue={editing?.date ?? new Date().toISOString().slice(0, 10)} required />
              <SelectField id="country" label="Country" options={isEvent ? ["Online", ...Object.keys(countryCodes)] : Object.keys(countryCodes)} defaultValue={editing?.country ?? ""} required />
              {isEvent ? (
                <TextField id="city" label="City / location" placeholder="City name, or Online" defaultValue={editing?.city} maxLength={100} required />
              ) : (
                <TextField id="industry" label="Industry" placeholder="Manufacturing, Packaging..." defaultValue={editing?.industry} maxLength={100} required />
              )}
              <div className="sm:col-span-2">
                <TextField id="redirectUrl" label="Website / registration link" type="url" placeholder="https://example.com/..." defaultValue={editing?.redirectUrl} maxLength={2048} required
                  hint="Visitors open this website in a new tab. No internal detail page is shown." />
              </div>
              <div className="sm:col-span-2">
                <TextField id="image" label="Image URL or local image path" defaultValue={editing?.image} maxLength={2048} optional
                  hint="Use an https:// image URL or /images/... path. Leave blank to use the default listing image." />
              </div>
              <div className="sm:col-span-2"><TextAreaField id="summary" label="Short description" defaultValue={editing?.summary} maxLength={1000} rows={3} optional /></div>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 sm:col-span-2">
                <input name="published" type="checkbox" defaultChecked={editing?.published ?? false} className="size-4 accent-[#0878c7]" />
                Publish on the website (uncheck to save as a draft or unpublish)
              </label>
              {isEvent && <p className="text-xs text-slate-500 sm:col-span-2">Published events appear in upcoming listings through their event date (UTC). Past events remain here for editing.</p>}
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button type="submit" className={`${button} bg-[#082b59] text-white hover:bg-[#0878c7]`}>{pending && <Spinner />} {editing ? "Save changes" : `Save ${singular}`}</button>
                {editing && <button type="button" className={`${button} border border-slate-200 text-slate-600`} onClick={() => { setEditing(null); setFormKey((key) => key + 1); setError(""); setMessage(""); }}>Cancel editing</button>}
              </div>
            </fieldset>
          </form>
          {error && <p role="alert" className="mt-4 text-sm font-medium text-rose-700">{error}</p>}
          {message && <p role="status" className="mt-4 text-sm font-medium text-emerald-700">{message}</p>}
        </Panel>
      </div>
      <Panel>
        <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-bold text-[#082b59]">Manage {kind}</h2>
        {!items.length ? <EmptyState>No {kind} yet. Add your first listing above.</EmptyState> : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#082b59]">{item.title}</h3>
                    <StatusBadge status={item.published ? "published" : "draft"} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.date} | {item.country}</p>
                  <a href={item.redirectUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-sm text-[#0878c7] underline">Open website (new tab)</a>
                </div>
                <button type="button" disabled={pending} className={`${button} border border-slate-200 text-[#082b59] hover:bg-slate-50`}
                  onClick={() => { setEditing(item); setFormKey((key) => key + 1); setError(""); setMessage(""); editor.current?.scrollIntoView({ block: "start" }); editor.current?.querySelector("input")?.focus({ preventScroll: true }); }}>
                  Edit <span className="sr-only">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
