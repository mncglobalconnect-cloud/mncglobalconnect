"use client";

import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Spinner } from "@/components/ui/form-controls";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStatus("sending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      if (!response.ok) {
        const result: { error?: string } = await response.json().catch(() => ({}));
        setError(result.error ?? "Subscription failed. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "done" ? (
        <motion.p
          key="done"
          role="status"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-2xl border border-[#35be84]/30 bg-[#35be84]/10 px-4 py-3.5 text-[13.5px] leading-relaxed text-white/85"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-[#7ef2c3]" />
          You&apos;re subscribed. Look out for market insights and new opportunities in your inbox.
        </motion.p>
      ) : (
        <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0 }} className="w-full">
          <label htmlFor="newsletter-email" className="sr-only">Business email</label>
          <div className="relative">
            <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-white/40" />
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); if (error) setError(""); }}
              placeholder="Your business email"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "newsletter-error" : undefined}
              className="h-14 w-full rounded-full border border-white/15 bg-white/[0.06] pl-11 pr-[136px] text-[15px] text-white outline-none transition placeholder:text-white/40 focus:border-[#20b7d5] focus:bg-white/[0.09] focus:ring-4 focus:ring-[#20b7d5]/15"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="brand-gradient absolute right-1.5 top-1/2 inline-flex h-11 -translate-y-1/2 items-center gap-1.5 rounded-full px-5 text-[13.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-wait"
            >
              {status === "sending" ? <Spinner /> : <>Subscribe <ArrowRight aria-hidden="true" className="size-3.5" /></>}
            </button>
          </div>
          {error && <p id="newsletter-error" role="alert" className="mt-2 pl-4 text-[12.5px] font-medium text-[#ff8a9a]">{error}</p>}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
