"use client";

import { useEffect, useState } from "react";
import { ApplicationField } from "./form-fields";

interface LocationFieldProps {
  id: string;
  label: string;
  country: string;
  state?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

type Lookup = { key: string; options: string[]; error?: string };

export function LocationField({ id, label, country, state, value, onChange, error, required }: LocationFieldProps) {
  const query = new URLSearchParams({ country, ...(state !== undefined ? { state } : {}) }).toString();
  const enabled = Boolean(country && (state === undefined || state));
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [manualKey, setManualKey] = useState("");
  const [attempt, setAttempt] = useState(0);
  const current = lookup?.key === query ? lookup : null;
  const loading = enabled && !current;
  const manual = manualKey === query;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    async function fetchOptions() {
      try {
        const response = await fetch(`/api/locations?${query}`);
        const result: unknown = await response.json();
        if (!response.ok) throw new Error("Location lookup failed. Retry or use manual entry.");
        if (typeof result !== "object" || result === null || !("options" in result)
          || !Array.isArray(result.options) || !result.options.every((item: unknown) => typeof item === "string")) {
          throw new Error("The location service returned invalid data. Retry or use manual entry.");
        }
        if (active) setLookup({ key: query, options: result.options });
      } catch (error) {
        if (active) setLookup({ key: query, options: [], error: error instanceof Error ? error.message : "Location lookup failed." });
      }
    }
    void fetchOptions();
    return () => { active = false; };
  }, [query, enabled, attempt]);

  const helper = !enabled ? (state === undefined ? "Select a country first." : "Select a state / province first.")
    : manual ? "Manual entry selected. Enter the location within the selected country / state."
      : loading ? "Loading locations..."
        : current?.error ?? (!current?.options.length ? "No locations are listed for this area. Use manual entry."
          : state === undefined ? "Only subdivisions of the selected country are listed."
            : "The provider lists cities/localities, not official district boundaries. Use manual entry for an unlisted district.");
  const options = current?.options ?? [];
  const unlisted = Boolean(value && !options.includes(value));
  return <div>
    <p className="sr-only" role="status">{helper}</p>
    <ApplicationField id={id} label={label} value={value} onChange={onChange} error={error} required={required}
      options={manual ? undefined : unlisted ? [value, ...options] : options}
      disabled={!enabled || (!manual && (loading || !options.length))}
      selectPlaceholder={loading ? "Loading locations..." : "Select a location"} helper={helper} />
    {enabled && <div className="mt-2 flex gap-4 text-xs font-semibold text-[#0878c7]">
      <button type="button" onClick={() => setManualKey(manual ? "" : query)}>{manual ? "Use location list" : "Location missing? Enter manually"}</button>
      {current?.error && <button type="button" onClick={() => { setLookup(null); setAttempt((previous) => previous + 1); }}>Retry locations</button>}
    </div>}
    {unlisted && !manual && current && <p className="join-field-help">Your saved / manually entered location is retained. Review it or choose a listed location.</p>}
  </div>;
}
