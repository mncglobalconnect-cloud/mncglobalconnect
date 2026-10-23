import { useId, useState } from "react";
import type { BillingRegion } from "@/types/membership";

export function RegionToggle({ region, onChange, name }: { region: BillingRegion; onChange: (region: BillingRegion) => void; name: string }) {
  return (
    <fieldset className="join-region-toggle" data-region={region}>
      <legend className="sr-only">Billing market</legend>
      {(["india", "global"] as const).map((value) => (
        <label key={value} className={region === value ? "is-selected" : ""}>
          <input type="radio" name={name} value={value} checked={region === value} onChange={() => onChange(value)} />
          {value === "india" ? "India (₹)" : "Global ($)"}
        </label>
      ))}
    </fieldset>
  );
}

export interface FieldOptions {
  label: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url" | "number";
  options?: readonly string[];
  multiline?: boolean;
  placeholder?: string;
  helper?: string;
  autoComplete?: string;
  disabled?: boolean;
  selectPlaceholder?: string;
}

export function ApplicationField({ id, value, onChange, error, label, required, type = "text", options, multiline, placeholder, helper, autoComplete, disabled, selectPlaceholder }: FieldOptions & { id: string; value: string; onChange: (value: string) => void; error?: string }) {
  const shared = {
    id, name: id, value, required, disabled, "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : helper ? `${id}-help` : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };
  return (
    <div className={`join-field ${multiline ? "sm:col-span-2" : ""}`}>
      <label htmlFor={id}>{label}{required && <span className="ml-1 text-[#148ce0]" aria-hidden="true">*</span>}{!required && <span className="ml-1.5 text-xs font-normal text-[#617087]">(optional)</span>}</label>
      {options ? <select {...shared}><option value="">{selectPlaceholder ?? "Select an option"}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
        : multiline ? <textarea {...shared} rows={4} maxLength={3000} placeholder={placeholder} />
          : <input {...shared} type={type} maxLength={type === "number" ? undefined : 500} placeholder={placeholder} autoComplete={autoComplete} />}
      {helper && <p id={`${id}-help`} className="join-field-help">{helper}</p>}
      {error && <p id={`${id}-error`} className="join-field-error">{error}</p>}
    </div>
  );
}

export function MultiSelect({ label, options, selected, onChange }: { label: string; options: readonly string[]; selected: string[]; onChange: (values: string[]) => void }) {
  const id = useId();
  const [search, setSearch] = useState("");
  const filtered = options.filter((option) => option.toLowerCase().includes(search.toLowerCase()));
  return (
    <fieldset className="join-multiselect">
      <legend>{label} <span className="font-normal text-[#617087]">(optional)</span></legend>
      <label className="sr-only" htmlFor={id}>Search {label.toLowerCase()}</label>
      <input id={id} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${label.toLowerCase()}`} />
      <div className="join-multiselect-options">
        {filtered.length ? filtered.map((option) => <label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={(event) => onChange(event.target.checked ? [...selected, option] : selected.filter((item) => item !== option))} />{option}</label>) : <p className="p-3 text-sm text-[#617087]">No matching options.</p>}
      </div>
      <p className="join-field-help" aria-live="polite">{selected.length ? `${selected.length} selected: ${selected.join(", ")}` : "Select all that apply."}</p>
    </fieldset>
  );
}
