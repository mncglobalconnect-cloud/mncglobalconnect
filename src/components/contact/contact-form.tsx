"use client";

import { ArrowRight, Building2, CheckCircle2, Globe2, Mail, MessageSquareText, RotateCcw, UserRound } from "lucide-react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useRef, useState, type FormEvent } from "react";
import { CheckboxField, SelectField, Spinner, TextAreaField, TextField } from "@/components/ui/form-controls";
import { contactTopics } from "@/data/contact";
import { membershipCountries } from "@/data/membership";


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_LIMIT = 1500;
const ease = [0.22, 1, 0.36, 1] as const;

type Values = { name: string; email: string; company: string; country: string; topic: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = { name: "", email: "", company: "", country: "", topic: "", message: "", consent: false };

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!values.email.trim()) errors.email = "Enter your business email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address, like name@company.com.";
  if (!values.country) errors.country = "Select your country.";
  if (!values.topic) errors.topic = "Choose what your enquiry is about.";
  if (values.message.trim().length < 20) errors.message = "Tell us a little more (at least 20 characters).";
  if (!values.consent) errors.consent = "Please confirm we may contact you about this enquiry.";
  return errors;
}

export function ContactForm() {
  const reducedMotion = useReducedMotion();
  const shake = useAnimationControls();
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    const next = validate(values);
    setErrors(next);
    const firstInvalid = Object.keys(next)[0];
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      if (!reducedMotion) void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      return;
    }
    setStatus("sending");
    setFormError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: values.company || undefined }),
      });
      const result: { error?: string; errors?: Errors } = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.errors) setErrors(result.errors);
        setFormError(result.error ?? "Your enquiry couldn't be sent. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
      cardRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  };

  const reset = () => {
    setValues(empty);
    setErrors({});
    setFormError("");
    setStatus("idle");
  };

  return (
    <motion.div ref={cardRef} animate={shake} className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_rgba(8,43,89,0.08)] sm:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div
            key="done"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            role="status"
            className="flex min-h-[520px] flex-col items-center justify-center text-center"
          >
            <motion.span
              initial={reducedMotion ? false : { scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="flex size-20 items-center justify-center rounded-full bg-[#35be84]/12 text-[#218864]"
            >
              <CheckCircle2 aria-hidden="true" className="size-10" />
            </motion.span>
            <h3 className="mt-6 text-[26px] font-bold tracking-[-0.02em] text-[#082b59]">Thank you, {values.name.split(" ")[0]}.</h3>
            <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-slate-500">
              We&apos;ve received your enquiry about <strong className="font-semibold text-slate-700">{values.topic.toLowerCase()}</strong>.
              Our team will reply to <strong className="font-semibold text-slate-700">{values.email}</strong>.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-[14px] font-bold text-[#082b59] transition hover:border-[#148ce0]/40 hover:bg-[#f2f8fc]"
            >
              <RotateCcw aria-hidden="true" className="size-4" /> Send another enquiry
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={submit}
            initial={false}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#082b59]">Send us a message</h2>
            <p className="mt-2 text-[14.5px] text-slate-500">All fields are required unless marked optional.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <TextField id="contact-name" label="Full name" icon={UserRound} autoComplete="name" placeholder="Your name"
                value={values.name} error={errors.name} onChange={(event) => update("name", event.target.value)} />
              <TextField id="contact-email" label="Business email" type="email" icon={Mail} autoComplete="email" placeholder="name@company.com"
                value={values.email} error={errors.email} onChange={(event) => update("email", event.target.value)} />
              <TextField id="contact-company" label="Company" icon={Building2} autoComplete="organization" placeholder="Company name" optional
                value={values.company} onChange={(event) => update("company", event.target.value)} />
              <SelectField id="contact-country" label="Country" icon={Globe2} options={membershipCountries} placeholder="Select your country"
                value={values.country} error={errors.country} onChange={(event) => update("country", event.target.value)} />
              <div className="sm:col-span-2">
                <SelectField id="contact-topic" label="What can we help with?" icon={MessageSquareText} options={contactTopics} placeholder="Choose a topic"
                  value={values.topic} error={errors.topic} onChange={(event) => update("topic", event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <TextAreaField id="contact-message" label="Message" maxLength={MESSAGE_LIMIT}
                  placeholder="Tell us about your business, the markets you are interested in and what you would like to achieve."
                  value={values.message} error={errors.message} onChange={(event) => update("message", event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <CheckboxField id="contact-consent" checked={values.consent} onChange={(event) => update("consent", event.target.checked)}
                  aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? "contact-consent-error" : undefined}>
                  I agree that MNC Global Connect may contact me about this enquiry, as described in the{" "}
                  <a href="/privacy" className="font-semibold text-[#0878c7] hover:underline">Privacy Policy</a>.
                </CheckboxField>
                {errors.consent && <p id="contact-consent-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-[#d6334a]">{errors.consent}</p>}
              </div>
            </div>
            {formError && <p role="alert" className="mt-6 rounded-xl bg-[#fff1f3] px-4 py-3 text-[13.5px] font-medium text-[#b4233a]">{formError}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="brand-gradient mt-8 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(20,140,224,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(20,140,224,0.38)] disabled:cursor-wait disabled:hover:translate-y-0 sm:w-auto sm:px-10"
            >
              {status === "sending" ? <><Spinner className="size-[18px]" /> Sending…</> : <>Send enquiry <ArrowRight aria-hidden="true" className="size-4" /></>}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
