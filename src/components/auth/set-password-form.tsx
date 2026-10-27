"use client";

import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordField, Spinner } from "@/components/ui/form-controls";

export function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (password.length < 10) next.password = "Use at least 10 characters.";
    else if (!/[a-z]/i.test(password) || !/\d/.test(password)) next.password = "Include at least one letter and one number.";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setPending(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result: { error?: string; field?: string; redirect?: string } = await response.json();
      if (!response.ok) {
        setErrors(result.field === "password" ? { password: result.error } : { form: result.error ?? "Something went wrong. Please try again." });
        return;
      }
      router.replace(result.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setErrors({ form: "We couldn't reach the server. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  };

  return (
    <main id="main-content" className="login-form-side flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-[440px]">
        <Link href="/" aria-label="MNC Global Connect home">
          <Image src="/logo/MNCGlobalConnectLogo.png" alt="MNC Global Connect" width={2091} height={1221} priority className="h-12 w-auto" />
        </Link>
        <span className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-[#35be84]/12 text-[#218864]">
          <KeyRound aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-5 text-[30px] font-bold tracking-[-0.025em] text-[#082b59]">Set your password</h1>
        {token ? (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-500">Choose a password for your MNC Global Connect member account.</p>
            <form noValidate onSubmit={submit} className="mt-8 grid gap-5">
              <PasswordField id="new-password" label="New password" icon={KeyRound} autoComplete="new-password"
                hint="At least 10 characters, with a letter and a number." value={password} error={errors.password}
                onChange={(event) => setPassword(event.target.value)} />
              <PasswordField id="confirm-password" label="Confirm password" icon={KeyRound} autoComplete="new-password"
                value={confirm} error={errors.confirm} onChange={(event) => setConfirm(event.target.value)} />
              {errors.form && <p role="alert" className="rounded-xl bg-[#fff1f3] px-4 py-3 text-[13.5px] font-medium text-[#b4233a]">{errors.form}</p>}
              <button type="submit" disabled={pending}
                className="brand-gradient flex min-h-[52px] items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(20,140,224,0.3)] transition hover:-translate-y-0.5 disabled:cursor-wait">
                {pending ? <><Spinner className="size-[18px]" /> Saving…</> : <>Set password and sign in <ArrowRight aria-hidden="true" className="size-4" /></>}
              </button>
            </form>
            <p className="mt-6 flex items-center gap-2 text-[12.5px] text-slate-500">
              <ShieldCheck aria-hidden="true" className="size-4 text-[#218864]" /> This link works once and expires automatically.
            </p>
          </>
        ) : (
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            This link is incomplete. Open the full link you received, or <Link href="/contact" className="font-semibold text-[#0878c7] hover:underline">contact us</Link> for a new one.
          </p>
        )}
      </div>
    </main>
  );
}
