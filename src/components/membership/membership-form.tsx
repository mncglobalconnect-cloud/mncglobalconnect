"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ExternalLink, FileCheck2, Save, Upload, X } from "lucide-react";
import { industries } from "@/data/industries";
import {
  applicationSteps, businessCategories, businessRoles, businessTypes,
  formatMembershipPrice, membershipCountries, membershipPlans, networkingGoals,
  nextSteps, requirementTypes, targetRegions,
} from "@/data/membership";
import {
  createApplication, DOCUMENT_TYPES, DRAFT_KEY, isHttpUrl, MAX_DOCUMENT_SIZE,
  parseDraft, parseReceipt, RECEIPT_KEY, validateApplicationStep,
} from "@/lib/membership-application";
import type { ApplicationErrors } from "@/lib/membership-application";
import type { ApplicationReceipt, ConsentState, MembershipApplication, MembershipSelection } from "@/types/membership";
import { ApplicationField, MultiSelect, RegionToggle } from "./form-fields";
import type { FieldOptions } from "./form-fields";
import { LocationField } from "./location-field";
import { getVerificationProfile } from "@/data/membership-verification";
import { AddressMapPreview, AddressSearch } from "./address-search";

type TextGroup = "personal" | "business" | "address" | "verification" | "referral";

const declarations: { key: keyof ConsentState; label: string; href?: string; required: boolean }[] = [
  { key: "accurate", label: "I confirm that the information provided is accurate.", required: true },
  { key: "terms", label: "I agree to the Terms of Membership.", href: "/terms", required: true },
  { key: "privacy", label: "I have read the Privacy Policy.", href: "/privacy", required: true },
  { key: "conduct", label: "I agree to the MNC Global Connect Code of Conduct.", href: "/terms", required: true },
  { key: "marketing", label: "I would like to receive business opportunities, events and updates.", required: false },
];

function DocumentChecklist({ country }: { country: string }) {
  const profile = getVerificationProfile(country);
  return <section className="my-6 rounded-xl border border-[#dce6ef] p-5" aria-label={`Verification document checklist for ${country}`}>
    <h4 className="font-semibold text-[#082b59]">Required Documents for Verification &mdash; {country}</h4>
    <p className="my-3 text-sm text-[#617087]">
      Proposed review checklist, not legal advice. Requirements depend on your legal form and registrations; all selections remain optional in this demo.
      {!profile.countrySpecific && " A general checklist is shown; confirm local requirements before a live application."}
    </p>
    <ul className="space-y-2 text-sm text-[#34536e]">{profile.documents.map(({ kind, guidance }) => <li key={kind}><strong>{kind}</strong> &mdash; {guidance}</li>)}</ul>
  </section>;
}

export function MembershipForm({ selection, onSelectionChange }: { selection: MembershipSelection; onSelectionChange: Dispatch<SetStateAction<MembershipSelection>> }) {
  const [data, setData] = useState(() => createApplication(selection));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState("");
  const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const hasMoved = useRef(false);
  const submittingLock = useRef(false);
  const application = { ...data, membership: selection };
  const plan = membershipPlans[selection.region].find((item) => item.id === selection.plan)!;
  const verificationProfile = getVerificationProfile(data.address.country);
  const reviewLabels: Record<string, string> = {
    ...baseReviewLabels,
    ...Object.fromEntries(verificationProfile.fields.map(({ key, label }) => [key, label])),
    district: "District / City / Locality",
  };

  useEffect(() => {
    if (hasMoved.current) heading.current?.focus({ preventScroll: true });
    hasMoved.current = true;
  }, [step]);

  function changeStep(next: number) {
    setErrors({});
    setNotice("");
    setStep(next);
    heading.current?.closest(".membership-form")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  function showErrors(nextErrors: ApplicationErrors) {
    setErrors(nextErrors);
    requestAnimationFrame(() => errorSummary.current?.focus());
  }

  function textField<G extends TextGroup>(group: G, key: keyof MembershipApplication[G] & string, options: FieldOptions) {
    const id = `${group}.${key}`;
    return <ApplicationField key={id} id={id} {...options} value={String(data[group][key])} error={errors[id]} onChange={(value) => {
      setData((previous) => ({
        ...previous,
        [group]: {
          ...previous[group], [key]: value,
          ...(group === "business" && key === "category" ? { subCategory: "" } : {}),
          ...(group === "address" && ["line1", "line2", "city", "postalCode"].includes(key) ? { mapsUrl: "" } : {}),
          ...(group === "address" && key === "country" ? { state: "", district: "", city: "", postalCode: "", mapsUrl: "" } : {}),
        },
        ...(group === "address" && key === "country" ? { verification: createApplication(selection).verification, documents: [] } : {}),
      }));
      if (group === "address" && key === "country") setErrors({});
    }} />;
  }

  function saveDraft() {
    setStorageError("");
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, application, step }));
      setNotice("Progress saved on this device. Only document names and metadata are retained, never file contents. Do not save sensitive information on a shared browser.");
    } catch (error) {
      setStorageError(`Your draft could not be saved. Browser storage may be disabled or full. Your current form is still here. ${error instanceof Error ? error.message : ""}`);
    }
  }

  function restoreDraft() {
    setStorageError("");
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) { setNotice("There is no saved draft in this browser yet."); return; }
      const draft = parseDraft(saved);
      const profile = getVerificationProfile(draft.application.address.country);
      const verification = createApplication(draft.application.membership).verification;
      for (const { key } of profile.fields) verification[key] = draft.application.verification[key];
      const documents = draft.application.documents.filter((doc) => profile.documents.some(({ kind }) => kind === doc.kind));
      setData({ ...draft.application, verification, documents });
      onSelectionChange(draft.application.membership);
      setStep(draft.step);
      setErrors({});
      setNotice("Saved draft restored. Only verification fields and document types applicable to your business country were restored; outdated entries were removed. Any document entries are metadata only, not uploaded files. Review your details before submitting.");
    } catch (error) {
      setStorageError(`Draft could not be restored. ${error instanceof Error ? error.message : "Browser storage is unavailable."}`);
    }
  }

  function loadStatus() {
    setStorageError("");
    try {
      const saved = localStorage.getItem(RECEIPT_KEY);
      if (!saved) { setNotice("No demo application reference is saved in this browser."); return; }
      setReceipt(parseReceipt(saved));
      setStatusOpen(true);
    } catch (error) {
      setStorageError(`Status could not be loaded. ${error instanceof Error ? error.message : "Browser storage is unavailable."}`);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingLock.current) return;
    const currentErrors = validateApplicationStep(application, step);
    if (Object.keys(currentErrors).length) { showErrors(currentErrors); return; }
    if (step < 7) { changeStep(step + 1); return; }
    for (let index = 0; index < applicationSteps.length; index++) {
      const stepErrors = validateApplicationStep(application, index);
      if (Object.keys(stepErrors).length) {
        setStep(index);
        showErrors(stepErrors);
        return;
      }
    }
    submittingLock.current = true;
    setSubmitting(true);
    setStorageError("");
    try {
      const bytes = crypto.getRandomValues(new Uint8Array(4));
      const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 6).toUpperCase();
      const result: ApplicationReceipt = { id: `MNC-${suffix}`, createdAt: new Date().toISOString(), membership: selection };
      localStorage.setItem(RECEIPT_KEY, JSON.stringify(result));
      setReceipt(result);
      setStatusOpen(false);
      setNotice("");
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) {
      setStorageError(`The demo application reference could not be saved. Nothing has been submitted. Your form is still available. ${error instanceof Error ? error.message : "Please check browser storage permissions."}`);
    } finally {
      submittingLock.current = false;
      setSubmitting(false);
    }
  }

  function requirementField(key: "type" | "title" | "description" | "country" | "value" | "timeline", options: FieldOptions) {
    return <ApplicationField key={key} id={`requirement.${key}`} {...options} value={data.requirement[key]} error={errors[`requirement.${key}`]} onChange={(value) => setData((previous) => ({ ...previous, requirement: { ...previous.requirement, [key]: value } }))} />;
  }

  if (receipt) {
    const receiptPlan = membershipPlans[receipt.membership.region].find((item) => item.id === receipt.membership.plan)!;
    return (
      <section className="membership-form join-receipt" id="application-status" aria-labelledby="receipt-title">
        <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#e9f8f1] text-[#218864]"><CheckCircle2 size={32} aria-hidden="true" /></span>
        <p className="section-eyebrow">Local demo confirmation</p>
        <h3 ref={heading} tabIndex={-1} id="receipt-title" className="mt-3 text-3xl font-semibold text-[#082b59]">{statusOpen ? "Demo Application Status" : "Application Received"}</h3>
        <p className="mt-4 leading-7 text-[#617087]">Thank you for applying to MNC Global Connect.</p>
        <div className="mx-auto my-7 max-w-lg rounded-xl bg-[#f5f9fd] p-5">
          <p className="text-xs text-[#617087]">Demo Application ID</p><p className="my-2 text-2xl font-bold tracking-wider text-[#082b59]">{receipt.id}</p>
          <p className="text-sm text-[#34536e]">{receiptPlan.name} &middot; {receipt.membership.region === "india" ? "India" : "Global"} billing</p>
          <p className="mt-2 text-xs text-[#617087]">Created {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(receipt.createdAt))}</p>
        </div>
        <p className="mx-auto max-w-xl text-sm leading-7 text-[#617087]"><strong className="text-[#082b59]">Saved in this browser only. Not sent or pending review.</strong> No verification, approval, payment invitation or activation has started. Your demo reference is not a member ID.</p>
        <h4 className="mb-4 mt-8 font-semibold text-[#082b59]">Next steps for the future live service</h4>
        <ol className="mx-auto max-w-md space-y-3 text-left">{nextSteps.map((item, i) => <li key={item} className="flex gap-3 text-sm text-[#34536e]"><span className="font-semibold text-[#148ce0]">0{i + 1}</span>{item}<span className="ml-auto text-xs text-[#617087]">Not started</span></li>)}</ol>
        <div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/" className="join-button">Go to Home<ArrowRight size={16} aria-hidden="true" /></Link><button type="button" className="join-button join-button-secondary" onClick={() => setStatusOpen((value) => !value)}>{statusOpen ? "View Confirmation" : "View Application Status"}</button></div>
        <button type="button" className="mt-6 text-sm font-semibold text-[#0878c7] underline underline-offset-4" onClick={() => { setReceipt(null); setStatusOpen(false); }}>Return to application</button>
        <p className="mt-5 text-xs text-[#617087]">If you explicitly saved a draft, it remains in browser storage until you clear it.</p>
      </section>
    );
  }

  return (
    <div className="membership-form">
      <div className="join-form-top">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-[#617087]">Your application</p><p className="mt-2 text-sm font-semibold text-[#082b59]">Step {step + 1} of {applicationSteps.length}</p></div>
        <div className="flex flex-wrap justify-end gap-x-4 gap-y-2">
          <button type="button" onClick={restoreDraft}>Restore Saved Draft</button>
          <button type="button" onClick={loadStatus}>View Local Demo Status</button>
        </div>
      </div>
      <nav aria-label="Application progress" className="join-progress">
        <ol>{applicationSteps.map((title, index) => <li key={title} aria-current={step === index ? "step" : undefined}><span className={step === index ? "is-current" : index < step ? "is-complete" : ""}>{index < step ? <Check size={14} aria-label="Completed" /> : index + 1}</span><span className="sr-only">{title}{step === index ? ", current step" : ""}</span></li>)}</ol>
      </nav>
      {notice && <p className="join-notice" role="status">{notice}</p>}
      {storageError && <p className="join-error-summary" role="alert">{storageError}</p>}
      <form onSubmit={submit} noValidate>
        <div className="join-step-heading">
          <p className="section-eyebrow">Step {String(step + 1).padStart(2, "0")}</p>
          <h3 ref={heading} tabIndex={-1}>{applicationSteps[step]}</h3>
          <p>{[
            "Let's start with the person behind the business. Fields marked * are required.",
            "Introduce your business and what you bring to the network.",
            "Help relevant partners understand where your business operates.",
            "All verification fields are optional in this prototype. Use sample details only.",
            "Tell us who you are, the connections you want and the markets you are exploring.",
            "Confirm your preferred access level and add a referral if applicable.",
            "Optional document preview only. Files stay on your device and are never uploaded.",
            "Review your details and declarations before creating your local demo reference.",
          ][step]}</p>
        </div>
        {Object.keys(errors).length > 0 && <div className="join-error-summary" role="alert" tabIndex={-1} ref={errorSummary}><p className="font-semibold">Please check the highlighted fields.</p><ul>{Object.entries(errors).map(([id, error]) => <li key={id}><a href={`#${id}`}>{error}</a></li>)}</ul></div>}
        <div key={step} className="join-step-content">
          {step === 0 && <div className="join-fields">
            {textField("personal", "fullName", { label: "Full Name", required: true, autoComplete: "name" })}
            {textField("personal", "designation", { label: "Designation / Job Title", required: true, autoComplete: "organization-title" })}
            {textField("personal", "email", { label: "Email Address", type: "email", required: true, autoComplete: "email", helper: "Email verification will be available through a future API. No email is sent here." })}
            {textField("personal", "residence", { label: "Country of Residence", required: true, options: membershipCountries })}
            {textField("personal", "dialCode", { label: "Country Code", type: "tel", required: true, placeholder: "+91", autoComplete: "tel-country-code" })}
            {textField("personal", "mobile", { label: "Mobile / WhatsApp Number", type: "tel", required: true, autoComplete: "tel-national", helper: "Mobile / OTP verification will be available later. No SMS is sent here." })}
          </div>}

          {step === 1 && <div className="join-fields">
            {textField("business", "company", { label: "Business / Company Name", required: true, autoComplete: "organization" })}
            {textField("business", "brand", { label: "Brand / Trade Name" })}
            {textField("business", "type", { label: "Business Type", required: true, options: businessTypes })}
            {textField("business", "category", { label: "Business Category", required: true, options: Object.keys(businessCategories) })}
            {textField("business", "subCategory", { label: "Business Sub-Category", required: true, options: businessCategories[data.business.category] ?? [], helper: "Select your business category first." })}
            {textField("business", "industry", { label: "Industry / Sector", required: true, options: [...industries, "Other"] })}
            {textField("business", "established", { label: "Year Established", type: "number", placeholder: "e.g. 2018" })}
            {textField("business", "employees", { label: "Number of Employees", options: ["1-10", "11-50", "51-200", "201-500", "501-1,000", "1,000+"] })}
            {textField("business", "description", { label: "Business Description", required: true, multiline: true, placeholder: "What does your business do, and who do you serve?" })}
            {textField("business", "products", { label: "Products / Services", required: true, multiline: true, placeholder: "Outline your main products, services or capabilities." })}
            {textField("business", "website", { label: "Website URL", type: "url", placeholder: "https://example.com" })}
            {textField("business", "linkedin", { label: "Company LinkedIn URL", type: "url", placeholder: "https://www.linkedin.com/company/..." })}
            {textField("business", "social", { label: "Other Social Media URL", type: "url", placeholder: "https://..." })}
          </div>}

          {step === 2 && <>
            <AddressSearch key={data.address.country} onSelect={(address) => {
              setData((previous) => ({
                ...previous, address,
                ...(address.country !== previous.address.country
                  ? { verification: createApplication(selection).verification, documents: [] } : {}),
              }));
              setErrors((previous) => Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith("address."))));
            }} />
            <div className="join-fields">
              {textField("address", "country", { label: "Business Country", required: true, options: membershipCountries, helper: "Changing country clears dependent location details, verification identifiers and document selections. Billing region is separate." })}
              {textField("address", "line1", { label: "Address Line 1", required: true, autoComplete: "address-line1" })}
              {textField("address", "line2", { label: "Address Line 2", autoComplete: "address-line2" })}
              <LocationField id="address.state" label="State / Province / Region" country={data.address.country} required
                value={data.address.state} error={errors["address.state"]} onChange={(state) => {
                  setData((previous) => ({ ...previous, address: { ...previous.address, state, district: "", city: "", postalCode: "", mapsUrl: "" } }));
                  setErrors((previous) => Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith("address."))));
                }} />
              <LocationField id="address.district" label="District / City / Locality" country={data.address.country} state={data.address.state}
                value={data.address.district} error={errors["address.district"]} onChange={(district) => setData((previous) => ({
                  ...previous, address: { ...previous.address, district, city: district, mapsUrl: "" },
                }))} />
              {textField("address", "city", { label: "City / Town", required: true, autoComplete: "address-level2", helper: "Filled from your locality selection. Edit if your postal city differs." })}
              {textField("address", "postalCode", { label: data.address.country === "India" ? "PIN Code" : "Postal / ZIP Code", required: true, autoComplete: "postal-code" })}
              {textField("address", "mapsUrl", { label: "Google Maps / Business Location Link", type: "url", placeholder: "https://maps.google.com/...", helper: "Paste your Google Maps business location or Google Business Profile link." })}
            </div>
            {data.address.mapsUrl && isHttpUrl(data.address.mapsUrl) && <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0878c7]" href={data.address.mapsUrl} target="_blank" rel="noopener noreferrer">Open Map Link<ExternalLink size={15} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>}
            <AddressMapPreview address={data.address} />
          </>}

          {step === 3 && <>
            <div className="join-notice">Verification details for {data.address.country} are optional and subject to future membership and legal rules. Do not enter real tax IDs or sensitive registration data here. Business PAN is not collected.</div>
            <div className="join-fields">
              {verificationProfile.fields.map(({ key, ...options }) => textField("verification", key, options))}
            </div>
            <DocumentChecklist country={data.address.country} />
          </>}

          {step === 4 && <>
            <div className="join-fields">
              <MultiSelect label="How Do You Do Business?" options={businessRoles} selected={data.networking.roles} onChange={(roles) => setData((previous) => ({ ...previous, networking: { ...previous.networking, roles } }))} />
              <MultiSelect label="What Are You Looking For?" options={networkingGoals} selected={data.networking.interests} onChange={(interests) => setData((previous) => ({ ...previous, networking: { ...previous.networking, interests } }))} />
            </div>
            <h4 className="join-form-subtitle">Global Business Interests</h4>
            <div className="join-fields">
              {(["currentMarkets", "targetCountries", "targetRegions", "preferredIndustries", "preferredConnections"] as const).map((key) => <MultiSelect key={key} label={{ currentMarkets: "Current Markets", targetCountries: "Target Countries", targetRegions: "Target Regions", preferredIndustries: "Preferred Industries", preferredConnections: "Preferred Business Connections" }[key]} options={key === "targetRegions" ? targetRegions : key === "preferredIndustries" ? [...industries, "Other"] : key === "preferredConnections" ? businessRoles : membershipCountries} selected={data.networking[key]} onChange={(values) => setData((previous) => ({ ...previous, networking: { ...previous.networking, [key]: values } }))} />)}
              {(["exportInterest", "importInterest"] as const).map((key) => <ApplicationField key={key} id={`networking.${key}`} label={key === "exportInterest" ? "Export Interest" : "Import Interest"} options={["Yes", "No", "Exploring"]} value={data.networking[key]} onChange={(value) => setData((previous) => ({ ...previous, networking: { ...previous.networking, [key]: value } }))} />)}
              <ApplicationField id="networking.objectives" label="Expected Business Objectives" multiline value={data.networking.objectives} onChange={(objectives) => setData((previous) => ({ ...previous, networking: { ...previous.networking, objectives } }))} placeholder="Tell us what you hope to achieve through the network." />
            </div>
            <fieldset className="mt-8"><legend className="mb-3 text-base font-semibold text-[#082b59]">Do You Currently Have a Business Requirement?</legend><div className="flex gap-6">{[false, true].map((enabled) => <label key={String(enabled)} className="inline-flex items-center gap-2 text-sm"><input type="radio" name="requirement-enabled" checked={data.requirement.enabled === enabled} onChange={() => setData((previous) => ({ ...previous, requirement: { ...previous.requirement, enabled } }))} />{enabled ? "Yes" : "No"}</label>)}</div></fieldset>
            {data.requirement.enabled && <div className="join-fields mt-6">
              {requirementField("type", { label: "Requirement Type", required: true, options: requirementTypes })}
              {requirementField("title", { label: "Requirement Title", required: true })}
              {requirementField("description", { label: "Short Description", required: true, multiline: true })}
              {requirementField("country", { label: "Target Country", options: membershipCountries })}
              {requirementField("value", { label: "Estimated Value Range", placeholder: "Include currency, e.g. USD 10,000-25,000" })}
              {requirementField("timeline", { label: "Expected Timeline", options: ["Within 1 month", "1-3 months", "3-6 months", "6-12 months", "Exploratory"] })}
            </div>}
          </>}

          {step === 5 && <>
            <div className="mb-6"><RegionToggle name="application-region" region={selection.region} onChange={(region) => onSelectionChange((previous) => ({ ...previous, region }))} /></div>
            <fieldset><legend className="mb-3 text-sm font-semibold text-[#082b59]">Choose Membership *</legend><div className="space-y-3">{membershipPlans[selection.region].map((option) => <label key={option.id} className={`join-plan-option ${selection.plan === option.id ? "is-selected" : ""}`}><input type="radio" name="membership.plan" value={option.id} checked={selection.plan === option.id} onChange={() => onSelectionChange((previous) => ({ ...previous, plan: option.id }))} /><span className="min-w-0 flex-1"><strong className="block text-sm text-[#082b59]">{option.name}{option.highlighted && <span className="ml-2 text-[10px] text-[#0878c7]">MOST POPULAR</span>}</strong><span className="mt-2 block text-xs leading-5 text-[#617087]">{option.features.slice(0, 3).join(" · ")}</span></span><span className="shrink-0 text-right text-sm font-bold text-[#082b59]">{formatMembershipPrice(option)}<span className="mt-1 block text-xs font-normal text-[#617087]">/ year</span></span></label>)}</div></fieldset>
            <p className="mt-4 text-xs leading-6 text-[#617087]">{selection.region === "india" ? "India (INR)" : "Global (USD)"} billing. Illustrative annual pricing and benefits, subject to confirmation. Taxes may be additional. No payment is collected.</p>
            <h4 className="join-form-subtitle">Referral Information</h4>
            <p className="mb-5 text-sm leading-6 text-[#617087]">Optional. Sponsor IDs, referrals and coupons are not validated or applied in this prototype.</p>
            <div className="join-fields">
              {textField("referral", "sponsorId", { label: "Sponsor / Referral Member ID" })}
              {textField("referral", "referredBy", { label: "Referred By", options: ["Member", "Business partner", "Event", "Online search", "Social media", "Other"] })}
              {textField("referral", "referrerName", { label: "Referrer Name" })}
              {textField("referral", "referralCode", { label: "Referral Code" })}
              {textField("referral", "coupon", { label: "Coupon Code", helper: "No discount is applied in this prototype." })}
            </div>
          </>}

          {step === 6 && <>
            <div className="join-notice">Use sample documents only. Accepted: PDF, JPG, PNG &middot; Maximum 5 MB per file. Purpose: preview the future business verification workflow. No file contents are read, saved or uploaded; only file metadata is kept. All documents are optional in this prototype.</div>
            <DocumentChecklist country={data.address.country} />
            <div className="grid gap-4 sm:grid-cols-2">
              {verificationProfile.documents.map(({ kind, guidance }, index) => {
                const doc = data.documents.find((item) => item.kind === kind);
                return <div key={kind} className="join-upload"><label htmlFor={`document-${index}`}><Upload size={18} aria-hidden="true" /><span>{kind}<span className="mt-1 block text-xs font-normal text-[#617087]">{guidance} Selection optional in this demo &middot; PDF, JPG or PNG, up to 5 MB</span></span></label><input id={`document-${index}`} type="file" accept=".pdf,.jpg,.jpeg,.png" aria-describedby={errors[`document-${index}`] ? `document-${index}-error` : undefined} aria-invalid={Boolean(errors[`document-${index}`])} onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const validExtension = /\.(pdf|jpe?g|png)$/i.test(file.name);
                  if (!validExtension || !DOCUMENT_TYPES.includes(file.type) || file.size === 0 || file.size > MAX_DOCUMENT_SIZE) {
                    setErrors((previous) => ({ ...previous, [`document-${index}`]: "Choose a non-empty PDF, JPG or PNG file up to 5 MB." }));
                    event.target.value = "";
                    return;
                  }
                  setErrors((previous) => { const next = { ...previous }; delete next[`document-${index}`]; return next; });
                  setData((previous) => ({ ...previous, documents: [...previous.documents.filter((item) => item.kind !== kind), { kind, name: file.name, size: file.size, type: file.type }] }));
                }} />
                  {doc && <div className="mt-3 flex items-start gap-2 text-xs text-[#34536e]"><FileCheck2 className="shrink-0 text-[#218864]" size={16} aria-hidden="true" /><span className="min-w-0 flex-1 break-words">{doc.name}<span className="mt-1 block text-[#617087]">{Math.ceil(doc.size / 1024)} KB &middot; metadata only</span></span><button type="button" aria-label={`Remove ${kind}`} onClick={() => { setData((previous) => ({ ...previous, documents: previous.documents.filter((item) => item.kind !== kind) })); const input = document.getElementById(`document-${index}`); if (input instanceof HTMLInputElement) input.value = ""; }}><X size={16} aria-hidden="true" /></button></div>}
                  {errors[`document-${index}`] && <p id={`document-${index}-error`} className="join-field-error" role="alert">{errors[`document-${index}`]}</p>}
                </div>;
              })}
            </div>
          </>}

          {step === 7 && <>
            <div className="join-review-plan"><div><p className="text-xs text-[#617087]">Selected membership &middot; {selection.region === "india" ? "India" : "Global"}</p><h4 className="mt-2 font-semibold text-[#082b59]">{plan.name}</h4></div><p className="text-xl font-bold text-[#082b59]">{formatMembershipPrice(plan)}<span className="text-xs font-normal text-[#617087]"> / year</span></p><button type="button" className="text-sm font-semibold text-[#0878c7]" onClick={() => changeStep(5)}>Edit plan</button></div>
            <p className="mb-6 text-xs leading-6 text-[#617087]">Illustrative annual pricing only; no charge or payment is made. Review the application sections below.</p>
            <div className="space-y-3">
              {([
                { title: "Personal Details", values: data.personal, edit: 0 },
                { title: "Business Profile", values: data.business, edit: 1 },
                { title: "Business Location", values: data.address, edit: 2 },
                { title: "Business Verification", values: Object.fromEntries(verificationProfile.fields.map(({ key }) => [key, data.verification[key]])), edit: 3 },
                { title: "Networking Interests", values: data.networking, edit: 4 },
                ...(data.requirement.enabled ? [{ title: "Current Business Requirement", values: data.requirement, edit: 4 }] : []),
                { title: "Referral Information", values: data.referral, edit: 5 },
              ]).map(({ title, values, edit }) => <details className="join-review" key={title}><summary>{title}<span>Review details</span></summary><dl>{Object.entries(values).filter(([key]) => key !== "enabled").map(([key, value]) => <div key={key}><dt>{reviewLabels[key] ?? key.replace(/([A-Z])/g, " $1")}</dt><dd>{Array.isArray(value) ? value.join(", ") || "Not provided" : String(value || "Not provided")}</dd></div>)}</dl><button type="button" className="mb-2 mt-4 text-sm font-semibold text-[#0878c7]" onClick={() => changeStep(edit)}>Edit {title.toLowerCase()}</button></details>)}
              <details className="join-review"><summary>Verification Documents<span>{data.documents.length} metadata entries</span></summary><ul className="space-y-2 text-sm text-[#617087]">{data.documents.length ? data.documents.map((doc) => <li key={doc.kind} className="break-words">{doc.kind}: {doc.name} ({Math.ceil(doc.size / 1024)} KB) &mdash; not uploaded</li>) : <li>No documents selected. Optional in this prototype.</li>}</ul><button type="button" className="mt-4 text-sm font-semibold text-[#0878c7]" onClick={() => changeStep(6)}>Edit document metadata</button></details>
            </div>
            <fieldset className="mt-8"><legend className="join-form-subtitle !mt-0">Declarations</legend><p className="mb-5 text-sm leading-6 text-[#617087]">Required declarations are separate from optional marketing consent. Live membership terms and policies must be finalised before production launch.</p><div className="space-y-4">{declarations.map(({ key, label, href, required }) => <div key={key}><label className="join-consent" htmlFor={`consent.${key}`}><input id={`consent.${key}`} type="checkbox" checked={data.consent[key]} required={required} aria-invalid={Boolean(errors[`consent.${key}`])} aria-describedby={errors[`consent.${key}`] ? `consent.${key}-error` : undefined} onChange={(event) => setData((previous) => ({ ...previous, consent: { ...previous.consent, [key]: event.target.checked } }))} /><span>{label}{required ? " *" : " (optional)"}{href && <Link href={href} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-[#0878c7] underline underline-offset-4">Read policy<ExternalLink size={12} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></Link>}</span></label>{errors[`consent.${key}`] && <p className="join-field-error ml-7" id={`consent.${key}-error`}>{errors[`consent.${key}`]}</p>}</div>)}</div></fieldset>
          </>}
        </div>
        <div className="join-form-actions">
          {step > 0 && <button className="join-button join-button-secondary" type="button" onClick={() => changeStep(step - 1)}><ArrowLeft size={15} aria-hidden="true" />Back</button>}
          <button className="join-save" type="button" onClick={saveDraft}><Save size={16} aria-hidden="true" />{step === 7 ? "Save & Continue Later" : "Save Progress"}</button>
          <button className="join-button sm:ml-auto" type="submit" disabled={submitting}>{submitting ? "Saving Demo Reference..." : step === 7 ? "Submit Membership Application" : "Continue"}<ArrowRight size={16} aria-hidden="true" /></button>
        </div>
        <p className="mt-5 text-xs leading-6 text-[#617087]">{step === 7 ? "Submitting an application does not guarantee approval. Profile activation is subject to business verification, membership eligibility and applicable payment. This prototype saves a demo reference only; no application data is sent." : "Progress stays in this form while changing steps. Save Progress explicitly stores your draft in this browser, including optional identifiers and document metadata. Avoid saving sensitive information or using a shared device."}</p>
      </form>
    </div>
  );
}

const baseReviewLabels: Record<string, string> = {
  fullName: "Full name", designation: "Job title", dialCode: "Calling code", residence: "Country of residence",
  subCategory: "Business sub-category", company: "Company", type: "Type", industry: "Industry",
  established: "Year established", linkedin: "LinkedIn URL", social: "Social media URL",
  line1: "Address line 1", line2: "Address line 2", mapsUrl: "Google Maps / Business Location Link",
  gstin: "GSTIN", cin: "CIN / LLPIN", udyam: "Udyam / MSME", iec: "IEC",
  tax: "Tax / VAT", tradeRegistration: "Import / export registration", sponsorId: "Sponsor / referral member ID",
};
