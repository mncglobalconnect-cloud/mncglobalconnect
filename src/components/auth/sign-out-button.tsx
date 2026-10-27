"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/form-controls";

const tones = {
  dark: "min-h-12 border-white/25 px-6 text-[14px] text-white hover:border-white/50 hover:bg-white/[0.06]",
  light: "min-h-10 border-slate-200 px-4 text-[13px] text-[#082b59] hover:border-[#148ce0]/40 hover:bg-[#f2f8fc]",
};

export function SignOutButton({ tone = "dark" }: { tone?: keyof typeof tones }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
        router.replace("/login");
        router.refresh();
      }}
      className={`inline-flex items-center gap-2 rounded-full border font-bold transition disabled:cursor-wait ${tones[tone]}`}
    >
      {pending ? <Spinner /> : <LogOut aria-hidden="true" className="size-4" />} Sign out
    </button>
  );
}
