import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export const metadata: Metadata = { title: "Set Your Password", robots: { index: false } };

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <SetPasswordForm token={typeof token === "string" ? token : ""} />;
}
