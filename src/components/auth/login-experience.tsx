"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Globe2,
  Handshake,
  Info,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckboxField, PasswordField, Spinner, TextField } from "@/components/ui/form-controls";

type View = "sign-in" | "reset";
type Status = "idle" | "loading" | "done" | "failed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ease = [0.22, 1, 0.36, 1] as const;

const valuePoints = [
  { icon: ShieldCheck, text: "Verified business profiles and members" },
  { icon: Handshake, text: "Qualified introductions and B2B meetings" },
  { icon: Globe2, text: "Opportunities across international markets" },
];

const activity = [
  { icon: BadgeCheck, title: "Introduction accepted", detail: "Manufacturer · India → UAE", className: "-left-[6%] top-[6%]", delay: 0 },
  { icon: Sparkles, title: "New buyer requirement", detail: "Packaging · Germany", className: "-right-[12%] top-[36%]", delay: 1.2 },
  { icon: CalendarCheck, title: "B2B meeting confirmed", detail: "Singapore · 12 Nov", className: "left-[2%] bottom-[2%]", delay: 2.4 },
];

/** Animated network illustration for the brand panel. */
function NetworkScene() {
  const reducedMotion = useReducedMotion();
  const nodes = [
    [200, 70], [318, 132], [330, 262], [214, 334], [92, 280], [74, 148],
  ] as const;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg viewBox="0 0 400 400" aria-hidden="true" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="login-route" x1="0" x2="1">
            <stop offset="0%" stopColor="#20b7d5" />
            <stop offset="100%" stopColor="#35be84" />
          </linearGradient>
          <radialGradient id="login-core">
            <stop offset="0%" stopColor="#20b7d5" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#20b7d5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="150" fill="url(#login-core)" opacity="0.35" />
        <g className="login-orbit">
          <circle cx="200" cy="200" r="168" fill="none" stroke="rgb(255 255 255 / 12%)" strokeDasharray="2 7" />
        </g>
        <g className="login-orbit login-orbit-reverse">
          <circle cx="200" cy="200" r="118" fill="none" stroke="rgb(255 255 255 / 14%)" strokeDasharray="1 6" />
        </g>
        <circle cx="200" cy="200" r="72" fill="none" stroke="rgb(255 255 255 / 10%)" />
        {nodes.map(([x, y], index) => (
          <motion.path
            key={`route-${x}-${y}`}
            d={`M200 200 Q ${(200 + x) / 2 + (index % 2 ? 30 : -30)} ${(200 + y) / 2 - 20} ${x} ${y}`}
            fill="none"
            stroke="url(#login-route)"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.2, delay: 0.4 + index * 0.15, ease }}
          />
        ))}
        {nodes.map(([x, y], index) => (
          <g key={`node-${x}-${y}`}>
            <circle cx={x} cy={y} r="11" fill="rgb(32 183 213 / 18%)" className="login-pulse" style={{ animationDelay: `${index * 0.4}s` }} />
            <circle cx={x} cy={y} r="4.5" fill="#e6fbff" />
          </g>
        ))}
        <circle cx="200" cy="200" r="24" fill="rgb(53 190 132 / 22%)" className="login-pulse" />
        <circle cx="200" cy="200" r="9" fill="#35be84" />
      </svg>
      {activity.map(({ icon: Icon, title, detail, className, delay }) => (
        <motion.div
          key={title}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [0, -8, 0] }}
          transition={reducedMotion ? undefined : {
            opacity: { duration: 0.6, delay: 0.9 + delay / 3 },
            y: { duration: 5, delay, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.09] py-2 pl-2 pr-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.25)] backdrop-blur-md ${className}`}
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#35be84]/20 text-[#7ef2c3]">
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <span>
            <span className="block text-[12px] font-bold text-white">{title}</span>
            <span className="block text-[10.5px] text-white/60">{detail}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease }}
      className="flex gap-3 rounded-2xl border border-[#bfe3f5] bg-[#f0f9fe] p-4 text-[13px] leading-relaxed text-[#1d3a5c]"
    >
      <Info aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-[#148ce0]" />
      <div>{children}</div>
    </motion.div>
  );
}

export function LoginExperience() {
  const reducedMotion = useReducedMotion();
  const shake = useAnimationControls();
  const [view, setView] = useState<View>("sign-in");
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const switchView = (next: View) => {
    setView(next);
    setStatus("idle");
    setErrors({});
    setFormError("");
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Enter your business email address.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address, like name@company.com.";
    if (view === "sign-in" && !password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const shakeForm = () => {
    if (!reducedMotion) void shake.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.45 } });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "loading") return;
    if (!validate()) { shakeForm(); return; }
    setStatus("loading");
    setFormError("");
    try {
      const response = await fetch(view === "sign-in" ? "/api/auth/login" : "/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(view === "sign-in" ? { email: email.trim(), password, remember } : { email: email.trim() }),
      });
      const result: { error?: string; redirect?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormError(result.error ?? "Something went wrong. Please try again.");
        setStatus("failed");
        shakeForm();
        return;
      }
      if (view === "sign-in") {
        router.replace(result.redirect ?? "/dashboard");
        router.refresh();
        return;
      }
      setStatus("done");
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
      setStatus("failed");
    }
  };

  const fieldMotion = (index: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.15 + index * 0.07, ease },
  });

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_1fr]">
      <aside className="login-brand relative hidden overflow-hidden text-white lg:flex lg:flex-col">
        <div aria-hidden="true" className="login-aurora pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="login-grid pointer-events-none absolute inset-0" />
        <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9eef7]">
              <span className="size-1.5 rounded-full bg-[#35be84]" /> Member access
            </span>
            <h2 className="mt-6 max-w-[460px] text-[clamp(2rem,3vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.025em]">
              Your global business network,{" "}
              <span className="bg-gradient-to-r from-[#5cc8f5] via-[#20b7d5] to-[#35be84] bg-clip-text text-transparent">one sign-in away.</span>
            </h2>
          </motion.div>
          <div className="my-8 flex-1 content-center">
            <NetworkScene />
          </div>
          <ul className="grid gap-3">
            {valuePoints.map(({ icon: Icon, text }, index) => (
              <motion.li
                key={text}
                initial={reducedMotion ? false : { opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1, ease }}
                className="flex items-center gap-3 text-[14px] font-medium text-white/80"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-[#7ef2c3]">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>

      <main id="main-content" className="login-form-side relative flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-10">
          <Link href="/" aria-label="MNC Global Connect home">
            <Image src="/logo/MNCGlobalConnectLogo.png" alt="MNC Global Connect" width={2091} height={1221} priority className="h-12 w-auto sm:h-14" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#082b59]">
            <ArrowLeft aria-hidden="true" className="size-4" /> Back to website
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-10">
          <motion.div animate={shake} className="w-full max-w-[440px]">
            <AnimatePresence mode="wait" initial={false}>
              {view === "sign-in" ? (
                <motion.div
                  key="sign-in"
                  initial={reducedMotion ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <motion.div {...fieldMotion(0)}>
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-[#148ce0]/10 text-[#148ce0]">
                      <Lock aria-hidden="true" className="size-5" />
                    </span>
                    <h1 className="mt-5 text-[30px] font-bold tracking-[-0.025em] text-[#082b59]">Welcome back</h1>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                      Sign in to manage your business profile, introductions and opportunities.
                    </p>
                  </motion.div>

                  <form noValidate onSubmit={submit} className="mt-8 grid gap-5">
                    <motion.div {...fieldMotion(1)}>
                      <TextField
                        id="login-email"
                        label="Business email"
                        type="email"
                        icon={Mail}
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={email}
                        error={errors.email}
                        onChange={(event) => { setEmail(event.target.value); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                      />
                    </motion.div>
                    <motion.div {...fieldMotion(2)}>
                      <PasswordField
                        id="login-password"
                        label="Password"
                        icon={KeyRound}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        error={errors.password}
                        onChange={(event) => { setPassword(event.target.value); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                        action={
                          <button type="button" onClick={() => switchView("reset")} className="text-[12.5px] font-semibold text-[#0878c7] hover:text-[#082b59]">
                            Forgot password?
                          </button>
                        }
                      />
                    </motion.div>
                    <motion.div {...fieldMotion(3)}>
                      <CheckboxField id="login-remember" checked={remember} onChange={(event) => setRemember(event.target.checked)}>
                        Keep me signed in on this device
                      </CheckboxField>
                    </motion.div>
                    <motion.div {...fieldMotion(4)}>
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="login-submit brand-gradient relative flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(20,140,224,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(20,140,224,0.38)] disabled:cursor-wait disabled:hover:translate-y-0"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {status === "loading" ? (
                            <motion.span key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="inline-flex items-center gap-2">
                              <Spinner className="size-[18px]" /> Signing in…
                            </motion.span>
                          ) : (
                            <motion.span key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="inline-flex items-center gap-2">
                              Sign in <ArrowRight aria-hidden="true" className="size-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.div>
                    <AnimatePresence>
                      {status === "failed" && formError && (
                        <motion.p role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="rounded-xl bg-[#fff1f3] px-4 py-3 text-[13.5px] font-medium leading-relaxed text-[#b4233a]">
                          {formError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <p className="text-[12.5px] leading-relaxed text-slate-500">
                      Applied recently? Your account is created when your application is approved; we&apos;ll send you a link to set your password.
                    </p>
                  </form>

                  <motion.div {...fieldMotion(5)} className="mt-8">
                    <div className="flex items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <span className="h-px flex-1 bg-slate-200" /> New to MNC Global Connect? <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <Link
                      href="/join-network"
                      className="mt-5 flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-slate-200 text-[15px] font-bold text-[#082b59] transition hover:border-[#148ce0]/40 hover:bg-[#f2f8fc]"
                    >
                      Apply for membership <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="reset"
                  initial={reducedMotion ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <button type="button" onClick={() => switchView("sign-in")} className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-[#082b59]">
                    <ArrowLeft aria-hidden="true" className="size-4" /> Back to sign in
                  </button>
                  <span className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-[#35be84]/12 text-[#218864]">
                    <KeyRound aria-hidden="true" className="size-5" />
                  </span>
                  <h1 className="mt-5 text-[30px] font-bold tracking-[-0.025em] text-[#082b59]">Reset your password</h1>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                    Enter the email linked to your membership and we&apos;ll arrange a secure reset link.
                  </p>
                  <form noValidate onSubmit={submit} className="mt-8 grid gap-5">
                    <TextField
                      id="reset-email"
                      label="Business email"
                      type="email"
                      icon={Mail}
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={email}
                      error={errors.email}
                      onChange={(event) => { setEmail(event.target.value); if (errors.email) setErrors({}); }}
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="brand-gradient flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(20,140,224,0.3)] transition hover:-translate-y-0.5 disabled:cursor-wait"
                    >
                      {status === "loading" ? <><Spinner className="size-[18px]" /> Sending…</> : <>Send reset link <ArrowRight aria-hidden="true" className="size-4" /></>}
                    </button>
                    <AnimatePresence>
                      {status === "done" && (
                        <Notice>
                          <strong className="font-bold">Request received.</strong> If this email belongs to an active member account,
                          our team will send you a one-time reset link. Need it sooner?{" "}
                          <Link href="/contact" className="font-bold text-[#0878c7] underline-offset-2 hover:underline">Contact us</Link>.
                        </Notice>
                      )}
                      {status === "failed" && formError && (
                        <motion.p role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="rounded-xl bg-[#fff1f3] px-4 py-3 text-[13.5px] font-medium text-[#b4233a]">
                          {formError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <p className="px-5 pb-6 text-center text-[12px] text-slate-400 sm:px-10">
          By signing in you agree to our{" "}
          <Link href="/terms" className="font-semibold text-slate-500 hover:text-[#082b59]">Terms</Link> and{" "}
          <Link href="/privacy" className="font-semibold text-slate-500 hover:text-[#082b59]">Privacy Policy</Link>.
        </p>
      </main>
    </div>
  );
}
