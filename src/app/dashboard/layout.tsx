import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/server/session";

// Per-request only: member pages depend on the signed-in user and live data.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Member area: only signed-in, active accounts. Pages re-check before reading member data.
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  return children;
}
