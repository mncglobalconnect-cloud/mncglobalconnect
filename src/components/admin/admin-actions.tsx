"use client";

import { Check, Copy, KeyRound, Link2, LockOpen, UserCheck, UserX, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/form-controls";

type LinkResult = { link: string; expiresIn: string; purpose: string };

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result: { error?: string } & Partial<LinkResult> & { link?: LinkResult | string } = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "The action failed. Please try again.");
  return result;
}

/** Shows a one-time password link with a copy button. */
function LinkBox({ result, onClose, closeLabel = "Dismiss" }: { result: LinkResult; onClose: () => void; closeLabel?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div role="status" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-emerald-800">
          One-time {result.purpose === "setup" ? "set-up" : "reset"} link, valid {result.expiresIn}. Send it to the member securely.
        </p>
        <button type="button" onClick={onClose} aria-label="Dismiss" className="text-emerald-700 hover:text-emerald-900"><X aria-hidden="true" className="size-4" /></button>
      </div>
      <div className="mt-3 flex gap-2">
        <input readOnly value={result.link} onFocus={(event) => event.target.select()} aria-label="Password link"
          className="h-10 min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 font-mono text-[12.5px] text-slate-700" />
        <button type="button" onClick={async () => {
          try { await navigator.clipboard.writeText(result.link); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* select and copy manually */ }
        }} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[13px] font-bold text-white hover:bg-emerald-700">
          {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {closeLabel !== "Dismiss" && (
        <button type="button" onClick={onClose} className="mt-3 text-[13px] font-bold text-emerald-800 underline-offset-2 hover:underline">{closeLabel}</button>
      )}
    </div>
  );
}

const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[13.5px] font-bold transition disabled:cursor-wait disabled:opacity-70";

export function ReviewActions({ reference }: { reference: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState<LinkResult | null>(null);

  const review = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !window.confirm(`Reject application ${reference}? This can't be undone here.`)) return;
    setPending(decision);
    setError("");
    try {
      const result = await post(`/api/admin/applications/${reference}/review`, { decision });
      // Keep the one-time link on screen; the page refreshes once the admin has copied it.
      if (decision === "approve" && result.link && typeof result.link === "object") setLink(result.link);
      else router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The action failed.");
    } finally {
      setPending(null);
    }
  };

  if (link) return <LinkBox result={link} closeLabel="I've copied the link, done" onClose={() => { setLink(null); router.refresh(); }} />;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending !== null} onClick={() => review("approve")} className={`${button} bg-emerald-600 text-white hover:bg-emerald-700`}>
          {pending === "approve" ? <Spinner /> : <UserCheck aria-hidden="true" className="size-4" />} Approve & create account
        </button>
        <button type="button" disabled={pending !== null} onClick={() => review("reject")} className={`${button} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}>
          {pending === "reject" ? <Spinner /> : <X aria-hidden="true" className="size-4" />} Reject
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-[13px] font-medium text-rose-700">{error}</p>}
    </div>
  );
}

export function MemberActions({ id, status, isSelf, locked = false }: { id: string; status: string; isSelf: boolean; locked?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [link, setLink] = useState<LinkResult | null>(null);

  const act = async (action: "disable" | "enable" | "unlock" | "password-link") => {
    if (action === "disable" && !window.confirm("Disable this account? The member is signed out immediately.")) return;
    setPending(action);
    setError("");
    try {
      const result = await post(`/api/admin/users/${id}`, { action });
      if (action === "password-link" && typeof result.link === "string") setLink(result as LinkResult);
      else router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The action failed.");
    } finally {
      setPending("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {locked && status !== "disabled" && (
          <button type="button" disabled={!!pending} onClick={() => act("unlock")} title="Clear the lockout from failed sign-ins"
            className={`${button} min-h-8 border border-amber-200 px-3 text-[12.5px] text-amber-700 hover:bg-amber-50`}>
            {pending === "unlock" ? <Spinner className="size-3.5" /> : <LockOpen aria-hidden="true" className="size-3.5" />} Unlock
          </button>
        )}
        {status !== "disabled" && (
          <button type="button" disabled={!!pending} onClick={() => act("password-link")} title="Create a one-time set-up or reset link"
            className={`${button} min-h-8 border border-slate-200 px-3 text-[12.5px] text-[#082b59] hover:bg-slate-50`}>
            {pending === "password-link" ? <Spinner className="size-3.5" /> : <KeyRound aria-hidden="true" className="size-3.5" />} Password link
          </button>
        )}
        {!isSelf && (status === "disabled" ? (
          <button type="button" disabled={!!pending} onClick={() => act("enable")} className={`${button} min-h-8 border border-emerald-200 px-3 text-[12.5px] text-emerald-700 hover:bg-emerald-50`}>
            {pending === "enable" ? <Spinner className="size-3.5" /> : <UserCheck aria-hidden="true" className="size-3.5" />} Enable
          </button>
        ) : (
          <button type="button" disabled={!!pending} onClick={() => act("disable")} className={`${button} min-h-8 border border-rose-200 px-3 text-[12.5px] text-rose-700 hover:bg-rose-50`}>
            {pending === "disable" ? <Spinner className="size-3.5" /> : <UserX aria-hidden="true" className="size-3.5" />} Disable
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-right text-[12.5px] font-medium text-rose-700">{error}</p>}
      {link && <LinkBox result={link} onClose={() => setLink(null)} />}
    </div>
  );
}

export function EnquiryStatusButton({ id, status }: { id: string; status: "new" | "handled" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const next = status === "new" ? "handled" : "new";
  return (
    <button type="button" disabled={pending} onClick={async () => {
      setPending(true);
      try { await post(`/api/admin/enquiries/${id}`, { status: next }); router.refresh(); } catch { /* status unchanged */ } finally { setPending(false); }
    }} className={`${button} min-h-8 border px-3 text-[12.5px] ${status === "new" ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
      {pending ? <Spinner className="size-3.5" /> : status === "new" ? <Check aria-hidden="true" className="size-3.5" /> : <Link2 aria-hidden="true" className="size-3.5" />}
      {status === "new" ? "Mark handled" : "Reopen"}
    </button>
  );
}
