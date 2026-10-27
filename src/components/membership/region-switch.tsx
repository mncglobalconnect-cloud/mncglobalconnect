"use client";

import { motion } from "motion/react";
import type { BillingRegion } from "@/types/membership";

export function RegionSwitch({ region, onChange, name, tone = "light" }: {
  region: BillingRegion; onChange: (region: BillingRegion) => void; name: string; tone?: "light" | "dark";
}) {
  return (
    <fieldset className={`relative inline-grid grid-cols-2 rounded-full p-1 ${tone === "dark" ? "bg-white/10" : "bg-slate-100"}`}>
      <legend className="sr-only">Pricing currency</legend>
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-[0_4px_12px_rgba(8,43,89,0.15)]"
        animate={{ x: region === "india" ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />
      {(["india", "global"] as const).map((value) => (
        <label key={value} className={`relative z-10 cursor-pointer rounded-full px-4 py-1.5 text-center text-[13px] font-bold transition-colors ${region === value ? "text-[#082b59]" : tone === "dark" ? "text-white/70" : "text-slate-500"}`}>
          <input type="radio" name={name} value={value} checked={region === value} onChange={() => onChange(value)} className="sr-only" />
          {value === "india" ? "India (₹)" : "Global ($)"}
        </label>
      ))}
    </fieldset>
  );
}
