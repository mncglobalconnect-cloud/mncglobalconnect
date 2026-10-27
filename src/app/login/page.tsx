import type { Metadata } from "next";
import { LoginExperience } from "@/components/auth/login-experience";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your MNC Global Connect member account.",
};

export default function LoginPage() {
  return <LoginExperience />;
}
