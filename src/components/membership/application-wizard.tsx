"use client";

import {
  ArrowLeft, ArrowRight, BadgeCheck, Briefcase, Building2, Calendar, Check, CheckCircle2, ClipboardList, Copy,
  FileCheck2, FileUp, Globe2, Info, Link2, Mail, MapPin, Network, Pencil, RotateCcw, Save, ShieldCheck,
  Sparkles, Trash2, UserRound, UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CheckboxField, SelectField, Spinner, TextAreaField, TextField } from "@/components/ui/form-controls";
import { countryCodes } from "@/data/country-codes";
import { industries } from "@/data/industries";
import {
  applicationSteps, businessCategories, businessRoles, businessTypes, formatMembershipPrice, membershipCountries,
  membershipPlans, networkingGoals, nextSteps, targetRegions,
} from "@/data/membership";
import { getVerificationProfile } from "@/data/membership-verification";
import { identifierRule, phonePlan, postalRule, requiredIdentifiers } from "@/lib/business-identity";
import {
  createApplication, DOCUMENT_TYPES, DRAFT_KEY, MAX_DOCUMENT_SIZE, parseDraft, RECEIPT_KEY,
} from "@/lib/membership-application";
import type { ApplicationReceipt, BillingRegion, MembershipApplication, MembershipPlanId } from "@/types/membership";
import { normaliseUrl, requiredDocumentKinds, validateStep, type StepErrors } from "./application-validation";
import { RegionSwitch } from "./region-switch";

const ease = [0.22, 1, 0.36, 1] as const;
const stepIcons: LucideIcon[] = [UserRound, Building2, MapPin, ShieldCheck, Network, Sparkles, FileUp, ClipboardList];
const stepIntros = [
  "Tell us who is applying on behalf of the business.",
  "Introduce your business and what it offers.",
  "Where your business is registered and operates.",
  "Registration details for your business country.",
  "Who you work with and what you're looking for.",
  "Choose the membership that fits your business.",
  "Attach documents for your business review.",
  "Check your details and confirm the declarations.",
];
const employeeRanges = ["1-10", "11-50", "51-200", "201-500", "501-1,000", "1,000+"];
const declarations = [
  { key: "accurate", label: <>The information I have provided is accurate and complete.</> },
  { key: "terms", label: <>I agree to the <Link href="/terms" className="font-semibold text-[#0878c7] hover:underline">Terms of Membership</Link>.</> },
  { key: "privacy", label: <>I have read the <Link href="/privacy" className="font-semibold text-[#0878c7] hover:underline">Privacy Policy</Link>.</> },
  { key: "conduct", label: <>I agree to the <Link href="/terms" className="font-semibold text-[#0878c7] hover:underline">Code of Conduct</Link>.</> },
] as const;

type Props = {
  region: BillingRegion;
  plan: MembershipPlanId;
  onRegionChange: (region: BillingRegion) => void;
  onPlanChange: (plan: MembershipPlanId) => void;
};

/** Select backed by /api/locations, with a manual-entry fallback when the list is missing or unavailable. */
function LocationSelect({ id, label, country, state, value, error, onChange }: {
  id: string; label: string; country: string; state?: string; value: string; error?: string; onChange: (value: string) => void;
}) {
  const query = new URLSearchParams({ country, ...(state !== undefined ? { state } : {}) }).toString();
  const enabled = Boolean(country && (state === undefined || state));
  const [lookup, setLookup] = useState<{ key: string; options: string[]; failed: boolean } | null>(null);
  const [manualFor, setManualFor] = useState("");
  const current = lookup?.key === query ? lookup : null;
  const loading = enabled && !current;
  const manual = manualFor === query || Boolean(current && (current.failed || !current.options.length));

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetch(`/api/locations?${query}`)
      .then(async (response) => {
        const result: unknown = await response.json();
        const options = typeof result === "object" && result && "options" in result && Array.isArray(result.options)
          ? result.options.filter((item: unknown): item is string => typeof item === "string") : null;
        if (active) setLookup({ key: query, options: options ?? [], failed: !response.ok || !options });
      })
      .catch(() => { if (active) setLookup({ key: query, options: [], failed: true }); });
    return () => { active = false; };
  }, [query, enabled]);

  const hint = !enabled ? (state === undefined ? "Select a country first." : "Select a state first.")
    : current?.failed ? "The location list is unavailable. Type it instead."
      : current && !current.options.length ? "No list for this area. Type it instead." : undefined;
  const toggle = enabled && current && !current.failed && current.options.length > 0 ? (
    <button type="button" onClick={() => setManualFor(manual ? "" : query)} className="text-[12px] font-semibold text-[#0878c7] hover:text-[#082b59]">
      {manual ? "Choose from list" : "Not listed?"}
    </button>
  ) : undefined;

  if (manual) {
    return <TextField id={id} label={label} icon={MapPin} value={value} error={error} hint={hint} action={toggle}
      placeholder={`Enter ${label.toLowerCase()}`} onChange={(event) => onChange(event.target.value)} />;
  }
  const options = current?.options ?? [];
  return (
    <SelectField id={id} label={label} icon={MapPin} value={value} error={error} hint={hint}
      options={value && !options.includes(value) ? [value, ...options] : options}
      placeholder={loading ? "Loading…" : `Select ${label.toLowerCase()}`} disabled={!enabled || loading}
      onChange={(event) => onChange(event.target.value)} />
  );
}

function ChipGroup({ id, label, options, selected, error, onChange, optional }: {
  id: string; label: string; options: readonly string[]; selected: string[]; error?: string; optional?: boolean;
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <p id={`${id}-label`} className="mb-2.5 text-[13px] font-semibold text-[#1d3150]">
        {label}{optional && <span className="ml-1.5 text-[12px] font-medium text-slate-400">(optional)</span>}
        {!optional && <span className="ml-2 text-[12px] font-medium text-slate-400">Select all that apply</span>}
      </p>
      <div id={id} role="group" aria-labelledby={`${id}-label`} tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button key={option} type="button" aria-pressed={active}
              onClick={() => onChange(active ? selected.filter((item) => item !== option) : [...selected, option])}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition ${active
                ? "border-[#148ce0] bg-[#148ce0] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#148ce0]/40 hover:text-[#0878c7]"}`}>
              {active && <Check aria-hidden="true" className="size-3" />}{option}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-[#d6334a]">{error}</p>}
    </div>
  );
}

function ReviewCard({ title, icon: Icon, onEdit, children }: { title: string; icon: LucideIcon; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[#fbfdff] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">
          <Icon aria-hidden="true" className="size-3.5 text-[#148ce0]" /> {title}
        </p>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0878c7] hover:text-[#082b59]">
          <Pencil aria-hidden="true" className="size-3" /> Edit
        </button>
      </div>
      <div className="grid gap-0.5 text-[13px] leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}

export function ApplicationWizard({ region, plan, onRegionChange, onPlanChange }: Props) {
  const reducedMotion = useReducedMotion();
  const [data, setData] = useState<MembershipApplication>(() => createApplication({ region, plan }));
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [furthest, setFurthest] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  // The actual files for attached documents; `data.documents` holds only their metadata.
  const files = useRef(new Map<string, File>());
  const application: MembershipApplication = { ...data, membership: { region, plan } };
  const plans = membershipPlans[region];
  const chosenPlan = plans.find((item) => item.id === plan) ?? plans[1];
  const profile = getVerificationProfile(data.address.country);
  const phone = phonePlan(countryCodes[data.personal.residence]);
  const postal = postalRule(data.address.country);
  const requiredDocs = requiredDocumentKinds(data.address.country);
  const progress = Math.round((step / (applicationSteps.length - 1)) * 100);

  useEffect(() => {
    if (moved.current) headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const clearErrors = (prefix: string) => setErrors((previous) =>
    Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith(prefix))));

  function set<G extends "personal" | "business" | "address" | "verification" | "referral">(
    group: G, key: keyof MembershipApplication[G], value: string,
  ) {
    setData((previous) => ({ ...previous, [group]: { ...previous[group], [key]: value } }));
    clearErrors(`${group}.${String(key)}`);
  }

  const goTo = (target: number) => {
    moved.current = true;
    setDirection(target > step ? 1 : -1);
    setErrors({});
    setNotice("");
    setStep(target);
    setFurthest((value) => Math.max(value, target));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const stepErrors = validateStep(application, step);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      const first = Object.keys(stepErrors)[0];
      const target = document.getElementById(first.startsWith("document.") ? `upload-${requiredDocs.indexOf(first.slice(9))}` : first);
      target?.focus();
      return;
    }
    if (step < applicationSteps.length - 1) { goTo(step + 1); return; }
    void send();
  };

  const send = async () => {
    const missing = application.documents.find((doc) => !files.current.has(doc.kind));
    if (missing) {
      goTo(6);
      setErrors({ [`document.${missing.kind}`]: "Please attach this file again." });
      return;
    }
    const form = new FormData();
    form.append("application", JSON.stringify(application));
    for (const doc of application.documents) form.append(`document:${doc.kind}`, files.current.get(doc.kind)!);
    setSubmitting(true);
    setNotice("");
    try {
      const response = await fetch("/api/applications", { method: "POST", body: form });
      const result: { reference?: string; createdAt?: string; error?: string; step?: number; errors?: StepErrors } =
        await response.json().catch(() => ({}));
      if (!response.ok || !result.reference) {
        if (typeof result.step === "number" && result.step !== step) goTo(result.step);
        if (result.errors) setErrors(result.errors);
        setNotice(result.error ?? "Your application couldn't be submitted. Please try again.");
        return;
      }
      const receipt: ApplicationReceipt = { id: result.reference, createdAt: result.createdAt ?? new Date().toISOString(), membership: { region, plan } };
      try {
        localStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt));
        localStorage.removeItem(DRAFT_KEY);
      } catch { /* the reference is still shown on screen */ }
      setReceipt(receipt);
    } catch {
      setNotice("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    try {
      // Files can't be kept in browser storage, so drafts leave documents out.
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, application: { ...application, documents: [] }, step }));
      setNotice("Draft saved on this device. Attached documents aren't saved; re-attach them before submitting.");
    } catch {
      setNotice("Your draft couldn't be saved. Browser storage may be disabled.");
    }
  };

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) { setNotice("No saved draft on this device yet."); return; }
      const draft = parseDraft(saved);
      files.current.clear();
      setData({ ...draft.application, documents: [] });
      onRegionChange(draft.application.membership.region);
      onPlanChange(draft.application.membership.plan);
      moved.current = true;
      setDirection(draft.step >= step ? 1 : -1);
      setStep(draft.step);
      setFurthest(draft.step);
      setErrors({});
      setNotice("Saved draft restored.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The saved draft couldn't be restored.");
    }
  };

  const setCountry = (country: string) => {
    // A new business country changes states, postal rules, registrations and documents.
    setData((previous) => ({
      ...previous,
      address: { ...previous.address, country, state: "", district: "", city: "", postalCode: "" },
      verification: createApplication({ region, plan }).verification,
      documents: [],
    }));
    files.current.clear();
    clearErrors("address.");
  };

  const attach = (kind: string, file: File | undefined) => {
    if (!file) return;
    const valid = /\.(pdf|jpe?g|png)$/i.test(file.name) && DOCUMENT_TYPES.includes(file.type) && file.size > 0 && file.size <= MAX_DOCUMENT_SIZE;
    if (!valid) { setErrors((previous) => ({ ...previous, [`document.${kind}`]: "Use a PDF, JPG or PNG up to 5 MB." })); return; }
    files.current.set(kind, file);
    setData((previous) => ({
      ...previous,
      documents: [...previous.documents.filter((doc) => doc.kind !== kind), { kind, name: file.name, size: file.size, type: file.type }],
    }));
    clearErrors(`document.${kind}`);
  };

  if (receipt) {
    return (
      <div className="wizard-shell flex items-center justify-center p-8">
        <motion.div role="status" initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease }} className="w-full max-w-[560px] text-center">
          <motion.span initial={reducedMotion ? false : { scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
            className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#35be84]/12 text-[#218864]">
            <CheckCircle2 aria-hidden="true" className="size-10" />
          </motion.span>
          <h3 className="mt-6 text-[28px] font-bold tracking-[-0.02em] text-[#082b59]">Application received</h3>
          <p className="mt-2 text-[15px] text-slate-500">
            {data.business.company} · {chosenPlan.name} ({formatMembershipPrice(chosenPlan)} / year)
          </p>
          <div className="mx-auto mt-6 flex max-w-[380px] items-center justify-center gap-3 rounded-2xl bg-[#f4f8fc] p-4">
            <span className="text-[13px] font-semibold text-slate-500">Reference</span>
            <span className="font-mono text-[20px] font-bold tracking-wider text-[#082b59]">{receipt.id}</span>
            <button type="button" onClick={async () => {
              try { await navigator.clipboard.writeText(receipt.id); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
            }} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#082b59]">
              <Copy aria-hidden="true" className="size-3.5" /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <ol className="mx-auto mt-7 grid max-w-[380px] gap-2.5 text-left">
            {nextSteps.map((item, index) => (
              <li key={item} className="flex items-center gap-3 text-[14px] text-slate-700">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#148ce0]/10 text-[11px] font-bold text-[#148ce0]">{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-6 max-w-[440px] rounded-xl bg-[#f4f8fc] p-3.5 text-[12.5px] leading-relaxed text-slate-600">
            We&apos;ll review your business and documents, then email <strong className="font-semibold text-slate-700">{data.personal.email}</strong> with next steps. Keep your reference for any enquiries.
          </p>
        </motion.div>
      </div>
    );
  }

  const StepIcon = stepIcons[step];
  const slide = {
    initial: reducedMotion ? false : { opacity: 0, x: 40 * direction },
    animate: { opacity: 1, x: 0 },
    exit: reducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 * direction },
    transition: { duration: 0.32, ease },
  } as const;

  return (
    <div className="wizard-shell grid lg:grid-cols-[290px_1fr]">
      {/* Step rail */}
      <aside className="wizard-rail relative hidden min-h-0 flex-col overflow-hidden px-6 py-6 text-white lg:flex">
        <div aria-hidden="true" className="login-aurora pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9eef7]">Membership application</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="brand-gradient h-full rounded-full" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease }} />
            </div>
            <span className="text-[12px] font-bold tabular-nums text-white/70">{progress}%</span>
          </div>
        </div>
        <nav aria-label="Application steps" className="wizard-steps relative -mx-1 mt-5 min-h-0 flex-1 overflow-y-auto px-1">
          <ol className="grid gap-0.5">
            {applicationSteps.map((title, index) => {
              const Icon = stepIcons[index];
              // Every step before the furthest one reached has passed validation.
              const done = index < furthest && index !== step;
              const current = index === step;
              const reachable = index <= furthest;
              return (
                <li key={title}>
                  <button type="button" disabled={!reachable || current} onClick={() => goTo(index)}
                    aria-current={current ? "step" : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition ${current ? "bg-white/10" : reachable ? "hover:bg-white/[0.06]" : "cursor-default"}`}>
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold transition ${current
                      ? "brand-gradient text-white shadow-[0_6px_16px_rgba(20,140,224,0.4)]"
                      : done ? "bg-[#35be84]/20 text-[#7ef2c3]" : "bg-white/[0.06] text-white/40"}`}>
                      {done ? <Check aria-hidden="true" className="size-4" /> : <Icon aria-hidden="true" className="size-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/40">Step {index + 1}</span>
                      <span className={`block truncate text-[13.5px] font-semibold ${current ? "text-white" : reachable ? "text-white/80" : "text-white/45"}`}>{title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="relative mt-4 shrink-0 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">Selected plan</p>
          <p className="mt-1 text-[15px] font-bold">{chosenPlan.name}</p>
          <p className="text-[12.5px] text-white/60">{formatMembershipPrice(chosenPlan)} / year · pay after approval</p>
        </div>
      </aside>

      {/* Step panel */}
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
        <header className="border-b border-slate-100 px-6 pb-4 pt-6 sm:px-9">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#148ce0]">Step {step + 1} of {applicationSteps.length}</p>
            <button type="button" onClick={restoreDraft} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-[#082b59]">
              <RotateCcw aria-hidden="true" className="size-3.5" /> Restore draft
            </button>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100 lg:hidden">
            <motion.div className="brand-gradient h-full" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease }} />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="hidden size-10 items-center justify-center rounded-xl bg-[#148ce0]/[0.08] text-[#148ce0] sm:flex">
              <StepIcon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 ref={headingRef} tabIndex={-1} className="text-[21px] font-bold tracking-[-0.02em] text-[#082b59] outline-none">{applicationSteps[step]}</h3>
              <p className="text-[13.5px] text-slate-500">{stepIntros[step]}</p>
            </div>
          </div>
          {notice && <p role="status" className="mt-3 rounded-lg bg-[#f0f9fe] px-3 py-2 text-[12.5px] text-[#1d3a5c]">{notice}</p>}
        </header>

        <div className="wizard-body relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 sm:px-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} {...slide}>
              {step === 0 && (
                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <TextField id="personal.fullName" label="Full name" icon={UserRound} autoComplete="name" placeholder="Your full name"
                    value={data.personal.fullName} error={errors["personal.fullName"]} onChange={(e) => set("personal", "fullName", e.target.value)} />
                  <TextField id="personal.designation" label="Job title" icon={Briefcase} autoComplete="organization-title" placeholder="e.g. Managing Director"
                    value={data.personal.designation} error={errors["personal.designation"]} onChange={(e) => set("personal", "designation", e.target.value)} />
                  <div className="sm:col-span-2">
                    <TextField id="personal.email" label="Business email" type="email" icon={Mail} autoComplete="email" placeholder="name@company.com"
                      hint="We'll use this to verify your application." value={data.personal.email} error={errors["personal.email"]}
                      onChange={(e) => set("personal", "email", e.target.value)} />
                  </div>
                  <SelectField id="personal.residence" label="Country you're based in" icon={Globe2} options={membershipCountries}
                    value={data.personal.residence} error={errors["personal.residence"]}
                    onChange={(e) => {
                      const next = phonePlan(countryCodes[e.target.value]);
                      setData((previous) => ({ ...previous, personal: { ...previous.personal, residence: e.target.value, dialCode: next?.dialCode ?? previous.personal.dialCode } }));
                      clearErrors("personal.");
                    }} />
                  <div className="form-field" data-invalid={errors["personal.mobile"] ? true : undefined}>
                    <label htmlFor="personal.mobile" className="mb-2 block text-[13px] font-semibold text-[#1d3150]">Mobile / WhatsApp</label>
                    <div className="flex">
                      <span className="flex min-h-[50px] shrink-0 items-center gap-1.5 rounded-l-[14px] border border-r-0 border-[#dbe4ee] bg-slate-50 px-3 text-[14px] font-semibold text-[#082b59]">
                        <span className="rounded bg-white px-1 text-[10.5px] font-bold text-slate-500 ring-1 ring-slate-200">{countryCodes[data.personal.residence] ?? "—"}</span>
                        {phone?.dialCode ?? data.personal.dialCode}
                      </span>
                      <input id="personal.mobile" type="tel" autoComplete="tel-national" inputMode="tel"
                        placeholder={phone?.example || "Mobile number"} value={data.personal.mobile}
                        aria-invalid={errors["personal.mobile"] ? true : undefined}
                        aria-describedby={errors["personal.mobile"] ? "personal.mobile-error" : "personal.mobile-hint"}
                        onChange={(e) => set("personal", "mobile", e.target.value)}
                        className="form-control !rounded-l-none" />
                    </div>
                    {errors["personal.mobile"]
                      ? <p id="personal.mobile-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-[#d6334a]">{errors["personal.mobile"]}</p>
                      : <p id="personal.mobile-hint" className="mt-1.5 text-[12.5px] text-slate-500">Code updates with your country.</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                  <TextField id="business.company" label="Company name" icon={Building2} autoComplete="organization" placeholder="Registered company name"
                    value={data.business.company} error={errors["business.company"]} onChange={(e) => set("business", "company", e.target.value)} />
                  <TextField id="business.brand" label="Brand / trade name" optional placeholder="If different"
                    value={data.business.brand} onChange={(e) => set("business", "brand", e.target.value)} />
                  <SelectField id="business.type" label="Business type" options={businessTypes} placeholder="Select type"
                    value={data.business.type} error={errors["business.type"]} onChange={(e) => set("business", "type", e.target.value)} />
                  <SelectField id="business.category" label="Category" options={Object.keys(businessCategories)} placeholder="Select category"
                    value={data.business.category} error={errors["business.category"]}
                    onChange={(e) => { setData((p) => ({ ...p, business: { ...p.business, category: e.target.value, subCategory: "" } })); clearErrors("business.category"); }} />
                  <SelectField id="business.subCategory" label="Sub-category" options={businessCategories[data.business.category] ?? []}
                    placeholder={data.business.category ? "Select sub-category" : "Choose a category first"} disabled={!data.business.category}
                    value={data.business.subCategory} error={errors["business.subCategory"]} onChange={(e) => set("business", "subCategory", e.target.value)} />
                  <SelectField id="business.industry" label="Industry" options={[...industries, "Other"]} placeholder="Select industry"
                    value={data.business.industry} error={errors["business.industry"]} onChange={(e) => set("business", "industry", e.target.value)} />
                  <TextField id="business.established" label="Year established" icon={Calendar} optional inputMode="numeric" placeholder="e.g. 2015"
                    value={data.business.established} error={errors["business.established"]} onChange={(e) => set("business", "established", e.target.value.replace(/\D/g, "").slice(0, 4))} />
                  <SelectField id="business.employees" label="Employees" optional options={employeeRanges} placeholder="Select range"
                    value={data.business.employees} onChange={(e) => set("business", "employees", e.target.value)} />
                  <TextField id="business.website" label="Website" icon={Link2} optional placeholder="company.com" autoComplete="url"
                    value={data.business.website} error={errors["business.website"]} onChange={(e) => set("business", "website", e.target.value)}
                    onBlur={(e) => { if (e.target.value.trim()) set("business", "website", normaliseUrl(e.target.value)); }} />
                  <div className="sm:col-span-2 xl:col-span-3">
                    <TextAreaField id="business.description" label="What does your business do?" maxLength={600} rows={2}
                      placeholder="Your products or services, who you serve and the markets you work in."
                      value={data.business.description} error={errors["business.description"]}
                      onChange={(e) => set("business", "description", e.target.value)} className="!min-h-[84px]" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <SelectField id="address.country" label="Business country" icon={Globe2} options={membershipCountries}
                    hint="Sets states, postal format, registrations and documents." value={data.address.country}
                    error={errors["address.country"]} onChange={(e) => setCountry(e.target.value)} />
                  <LocationSelect id="address.state" label="State / province" country={data.address.country}
                    value={data.address.state} error={errors["address.state"]}
                    onChange={(value) => { setData((p) => ({ ...p, address: { ...p.address, state: value, city: "", district: "" } })); clearErrors("address.state"); }} />
                  <LocationSelect id="address.city" label="City" country={data.address.country} state={data.address.state}
                    value={data.address.city} error={errors["address.city"]}
                    onChange={(value) => { setData((p) => ({ ...p, address: { ...p.address, city: value, district: value } })); clearErrors("address.city"); }} />
                  <TextField id="address.postalCode" label={postal.label} optional={!postal.required} autoComplete="postal-code"
                    placeholder={postal.example ? `e.g. ${postal.example}` : postal.label}
                    value={data.address.postalCode} error={errors["address.postalCode"]} onChange={(e) => set("address", "postalCode", e.target.value)} />
                  <div className="sm:col-span-2">
                    <TextField id="address.line1" label="Street address" icon={Building2} autoComplete="address-line1" placeholder="Building, street"
                      value={data.address.line1} error={errors["address.line1"]} onChange={(e) => set("address", "line1", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <TextField id="address.line2" label="Area / landmark" optional autoComplete="address-line2" placeholder="Area, landmark or suite"
                      value={data.address.line2} onChange={(e) => set("address", "line2", e.target.value)} />
                  </div>
                </div>
              )}

              {step === 3 && (() => {
                const anyOf = requiredIdentifiers(data.address.country).filter((key) => profile.fields.some((f) => f.key === key));
                return (
                  <div>
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#cfe6f5] bg-[#f3f9fd] p-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[12px] font-bold text-[#082b59] ring-1 ring-[#cfe6f5]">
                        {countryCodes[data.address.country]}
                      </span>
                      <p className="text-[13px] leading-relaxed text-[#1d3a5c]">
                        <strong className="font-bold">Registrations for {data.address.country}.</strong>{" "}
                        {anyOf.length > 1
                          ? `Provide at least one of: ${profile.fields.filter((f) => anyOf.includes(f.key)).map((f) => f.label).join(", ")}.`
                          : `Your ${profile.fields.find((f) => f.key === anyOf[0])?.label ?? "business registration number"} is required; the rest apply only if registered.`}
                        {!profile.countrySpecific && " We'll confirm any local requirements during review."}
                      </p>
                    </div>
                    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                      {profile.fields.map(({ key, label, helper }) => {
                        const rule = identifierRule(data.address.country, key);
                        return (
                          <TextField key={key} id={`verification.${key}`} label={label}
                            optional={!anyOf.includes(key)} placeholder={rule ? `e.g. ${rule.example}` : label}
                            hint={helper} value={data.verification[key]} error={errors[`verification.${key}`]}
                            onChange={(e) => { set("verification", key, e.target.value.toUpperCase()); clearErrors("verification."); }} />
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {step === 4 && (
                <div className="grid gap-5">
                  <ChipGroup id="networking.roles" label="How do you do business?" options={businessRoles}
                    selected={data.networking.roles} error={errors["networking.roles"]}
                    onChange={(roles) => { setData((p) => ({ ...p, networking: { ...p.networking, roles } })); clearErrors("networking.roles"); }} />
                  <ChipGroup id="networking.interests" label="What are you looking for?" options={networkingGoals}
                    selected={data.networking.interests} error={errors["networking.interests"]}
                    onChange={(interests) => { setData((p) => ({ ...p, networking: { ...p.networking, interests } })); clearErrors("networking.interests"); }} />
                  <ChipGroup id="networking.targetRegions" label="Markets you want to reach" optional options={targetRegions}
                    selected={data.networking.targetRegions}
                    onChange={(targetRegions) => setData((p) => ({ ...p, networking: { ...p.networking, targetRegions } }))} />
                </div>
              )}

              {step === 5 && (
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[13px] text-slate-500">Annual membership. You only pay once your business is approved.</p>
                    <RegionSwitch region={region} onChange={onRegionChange} name="wizard-region" />
                  </div>
                  <div role="radiogroup" aria-label="Membership plan" className="grid gap-3 md:grid-cols-3">
                    {plans.map((item) => {
                      const selected = item.id === plan;
                      return (
                        <label key={item.id} className={`relative flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition ${selected
                          ? "border-[#148ce0] bg-[#f2f8fd] shadow-[0_12px_28px_rgba(20,140,224,0.15)]" : "border-slate-200 hover:border-[#148ce0]/40"}`}>
                          <input type="radio" name="wizard-plan" value={item.id} checked={selected} onChange={() => onPlanChange(item.id)} className="sr-only" />
                          {item.highlighted && <span className="absolute -top-2.5 right-3 rounded-full bg-[#35be84] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">Popular</span>}
                          <span className="flex items-center justify-between">
                            <span className="text-[15px] font-bold text-[#082b59]">{item.name}</span>
                            <span className={`flex size-5 items-center justify-center rounded-full border-2 ${selected ? "border-[#148ce0]" : "border-slate-300"}`}>
                              {selected && <span className="size-2.5 rounded-full bg-[#148ce0]" />}
                            </span>
                          </span>
                          <span className="mt-1 text-[22px] font-bold text-[#082b59]">{formatMembershipPrice(item)}<span className="text-[12px] font-medium text-slate-500"> / year</span></span>
                          <ul className="mt-3 grid gap-1.5">
                            {item.features.slice(0, 4).map((feature) => (
                              <li key={feature} className="flex items-start gap-1.5 text-[12.5px] text-slate-600">
                                <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#218864]" />{feature}
                              </li>
                            ))}
                          </ul>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
                    <TextField id="referral.sponsorId" label="Referred by a member?" optional placeholder="Member ID"
                      value={data.referral.sponsorId} onChange={(e) => set("referral", "sponsorId", e.target.value)} />
                    <TextField id="referral.coupon" label="Coupon code" optional placeholder="Code"
                      value={data.referral.coupon} onChange={(e) => set("referral", "coupon", e.target.value)} />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <p className="mb-4 flex items-start gap-2 text-[13px] leading-relaxed text-slate-500">
                    <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#148ce0]" />
                    <span>Documents for a business in <strong className="font-semibold text-slate-700">{data.address.country}</strong>. PDF, JPG or PNG up to 5 MB each.</span>
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profile.documents.map(({ kind, guidance }, index) => {
                      const doc = data.documents.find((item) => item.kind === kind);
                      const required = requiredDocs.includes(kind);
                      const error = errors[`document.${kind}`];
                      return (
                        <div key={kind} className={`rounded-2xl border p-3.5 transition ${error ? "border-[#e0566a] bg-[#fffafb]" : doc ? "border-[#35be84]/40 bg-[#f4fbf7]" : "border-slate-200"}`}>
                          <div className="flex items-start gap-3">
                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${doc ? "bg-[#35be84]/15 text-[#218864]" : "bg-[#148ce0]/[0.08] text-[#148ce0]"}`}>
                              {doc ? <FileCheck2 aria-hidden="true" className="size-[18px]" /> : <FileUp aria-hidden="true" className="size-[18px]" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13.5px] font-bold leading-snug text-[#082b59]">
                                {kind}
                                <span className={`ml-2 rounded-full px-1.5 py-0.5 align-middle text-[9.5px] font-bold uppercase tracking-wider ${required ? "bg-[#148ce0]/10 text-[#0878c7]" : "bg-slate-100 text-slate-500"}`}>
                                  {required ? "Required" : "Optional"}
                                </span>
                              </p>
                              {doc
                                ? <p className="mt-0.5 truncate text-[12px] text-[#218864]">{doc.name} · {Math.ceil(doc.size / 1024)} KB</p>
                                : <p className="mt-0.5 text-[12px] text-slate-500">{guidance}</p>}
                              {error && <p role="alert" className="mt-1 text-[12px] font-medium text-[#d6334a]">{error}</p>}
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              {doc && (
                                <button type="button" aria-label={`Remove ${kind}`}
                                  onClick={() => { files.current.delete(kind); setData((p) => ({ ...p, documents: p.documents.filter((item) => item.kind !== kind) })); }}
                                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-[#d6334a]">
                                  <Trash2 aria-hidden="true" className="size-4" />
                                </button>
                              )}
                              <label htmlFor={`upload-${index}`} className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#082b59] transition hover:border-[#148ce0]/40 focus-within:ring-2 focus-within:ring-[#148ce0]/40">
                                {doc ? "Replace" : "Choose"}
                                <input id={`upload-${index}`} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only"
                                  onChange={(e) => { attach(kind, e.target.files?.[0]); e.target.value = ""; }} />
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[12px] text-slate-400">Files are uploaded securely when you submit your application and used only for your business review.</p>
                </div>
              )}

              {step === 7 && (
                <div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <ReviewCard title="Applicant" icon={UserRound} onEdit={() => goTo(0)}>
                      <span className="font-semibold text-[#082b59]">{data.personal.fullName}</span>
                      <span>{data.personal.designation}</span>
                      <span className="truncate">{data.personal.email}</span>
                      <span>{data.personal.dialCode} {data.personal.mobile}</span>
                    </ReviewCard>
                    <ReviewCard title="Business" icon={Building2} onEdit={() => goTo(1)}>
                      <span className="font-semibold text-[#082b59]">{data.business.company}</span>
                      <span>{data.business.type} · {data.business.industry}</span>
                      <span>{data.business.category} / {data.business.subCategory}</span>
                    </ReviewCard>
                    <ReviewCard title="Location" icon={MapPin} onEdit={() => goTo(2)}>
                      <span>{data.address.line1}</span>
                      <span>{[data.address.city, data.address.state].filter(Boolean).join(", ")}</span>
                      <span>{data.address.country} {data.address.postalCode}</span>
                    </ReviewCard>
                    <ReviewCard title="Registrations" icon={ShieldCheck} onEdit={() => goTo(3)}>
                      {profile.fields.filter((f) => data.verification[f.key]).map((f) => (
                        <span key={f.key}><span className="text-slate-500">{f.label}:</span> {data.verification[f.key]}</span>
                      ))}
                    </ReviewCard>
                    <ReviewCard title="Interests" icon={UsersRound} onEdit={() => goTo(4)}>
                      <span className="line-clamp-2">{data.networking.roles.join(", ")}</span>
                      <span className="line-clamp-2 text-slate-500">{data.networking.interests.join(", ")}</span>
                    </ReviewCard>
                    <ReviewCard title="Plan & documents" icon={BadgeCheck} onEdit={() => goTo(5)}>
                      <span className="font-semibold text-[#082b59]">{chosenPlan.name} · {formatMembershipPrice(chosenPlan)} / year</span>
                      <span>{data.documents.length} document{data.documents.length === 1 ? "" : "s"} attached</span>
                    </ReviewCard>
                  </div>
                  <fieldset className="mt-5">
                    <legend className="mb-3 text-[13px] font-semibold text-[#1d3150]">Declarations</legend>
                    <div className="grid gap-x-6 gap-y-2.5 md:grid-cols-2">
                      {declarations.map(({ key, label }) => (
                        <div key={key}>
                          <CheckboxField id={`consent.${key}`} checked={data.consent[key]}
                            aria-invalid={errors[`consent.${key}`] ? true : undefined}
                            onChange={(e) => { setData((p) => ({ ...p, consent: { ...p.consent, [key]: e.target.checked } })); clearErrors(`consent.${key}`); }}>
                            {label}
                          </CheckboxField>
                          {errors[`consent.${key}`] && <p role="alert" className="pl-7 text-[12px] font-medium text-[#d6334a]">{errors[`consent.${key}`]}</p>}
                        </div>
                      ))}
                      <CheckboxField id="consent.marketing" checked={data.consent.marketing}
                        onChange={(e) => setData((p) => ({ ...p, consent: { ...p.consent, marketing: e.target.checked } }))}>
                        Send me business opportunities, events and updates (optional).
                      </CheckboxField>
                    </div>
                  </fieldset>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="flex items-center gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:px-9">
          {step > 0 && (
            <button type="button" onClick={() => goTo(step - 1)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-200 px-5 text-[14px] font-bold text-[#082b59] transition hover:border-[#148ce0]/40 hover:bg-[#f2f8fc]">
              <ArrowLeft aria-hidden="true" className="size-4" /> Back
            </button>
          )}
          <button type="button" onClick={saveDraft}
            className="hidden min-h-12 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#082b59] sm:inline-flex">
            <Save aria-hidden="true" className="size-4" /> Save draft
          </button>
          <button type="submit" disabled={submitting}
            className="brand-gradient ml-auto inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-[14.5px] font-bold text-white shadow-[0_12px_28px_rgba(20,140,224,0.3)] transition hover:-translate-y-0.5 disabled:cursor-wait">
            {submitting ? <><Spinner className="size-[18px]" /> Submitting…</>
              : step === applicationSteps.length - 1 ? <>Submit application <Check aria-hidden="true" className="size-4" /></>
                : <>Next: {applicationSteps[step + 1]} <ArrowRight aria-hidden="true" className="size-4" /></>}
          </button>
        </footer>
      </form>
    </div>
  );
}
