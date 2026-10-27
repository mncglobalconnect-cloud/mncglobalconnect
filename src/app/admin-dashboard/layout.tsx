import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { collections } from "@/lib/db/mongodb";
import { getAdmin } from "@/lib/server/admin";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | MNC Global Connect" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  // Signed-in members get a plain 404 rather than confirming the admin area exists.
  const admin = await getAdmin();
  if (!admin) notFound();

  const { applications, contactEnquiries } = await collections();
  const [pendingApplications, newEnquiries] = await Promise.all([
    applications.countDocuments({ status: "submitted" }),
    contactEnquiries.countDocuments({ status: "new" }),
  ]);

  return (
    <div className="min-h-dvh bg-[#f4f7fb] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="admin-sidebar flex flex-col gap-5 p-4 text-white lg:sticky lg:top-0 lg:h-dvh lg:p-5">
        <div className="flex items-center justify-between gap-3 lg:block">
          <Link href="/admin-dashboard" className="inline-flex items-center gap-2.5 rounded-xl bg-white px-3 py-2">
            <Image src="/logo/MNCGlobalConnectLogo.png" alt="MNC Global Connect" width={2091} height={1221} className="h-8 w-auto" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#082b59]">Admin</span>
          </Link>
          <Link href="/" className="text-[12.5px] font-semibold text-white/60 hover:text-white lg:mt-4 lg:block">View website ↗</Link>
        </div>
        <AdminNav pending={{ applications: pendingApplications, enquiries: newEnquiries }} />
        <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/[0.05] p-3 lg:block">
          <p className="truncate text-[13px] font-bold">{admin.name}</p>
          <p className="truncate text-[12px] text-white/55">{admin.email}</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-end gap-3 border-b border-slate-200/80 bg-white px-5 py-3 sm:px-8">
          <span className="hidden text-[13px] text-slate-500 sm:inline">Signed in as <strong className="font-semibold text-slate-700">{admin.name}</strong></span>
          <SignOutButton tone="light" />
        </header>
        <main id="main-content" className="px-5 py-7 sm:px-8 sm:py-9">{children}</main>
      </div>
    </div>
  );
}
