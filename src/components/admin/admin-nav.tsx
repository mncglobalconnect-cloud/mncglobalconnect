"use client";

import { BriefcaseBusiness, CalendarDays, FileText, Inbox, LayoutDashboard, Mail, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items: { href: string; label: string; icon: LucideIcon; countKey?: "applications" | "enquiries" }[] = [
  { href: "/admin-dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin-dashboard/applications", label: "Applications", icon: FileText, countKey: "applications" },
  { href: "/admin-dashboard/members", label: "Members", icon: UsersRound },
  { href: "/admin-dashboard/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { href: "/admin-dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/admin-dashboard/enquiries", label: "Enquiries", icon: Inbox, countKey: "enquiries" },
  { href: "/admin-dashboard/subscribers", label: "Subscribers", icon: Mail },
];

/** Sidebar links; counts show items waiting for action. */
export function AdminNav({ pending }: { pending: { applications: number; enquiries: number } }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: Icon, countKey }) => {
        const active = href === "/admin-dashboard" ? pathname === href : pathname.startsWith(href);
        const count = countKey ? pending[countKey] : 0;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${active
              ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"}`}>
            <Icon aria-hidden="true" className="size-[18px]" />
            <span className="flex-1">{label}</span>
            {count > 0 && <span className="rounded-full bg-[#35be84] px-2 py-0.5 text-[11px] font-bold text-white">{count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
