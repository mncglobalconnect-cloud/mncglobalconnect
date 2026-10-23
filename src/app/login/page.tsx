import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <RoutePlaceholder
      title="Welcome Back"
      description="Sign-in experience for the shared MNC ecosystem identity will be connected to the authentication service."
    />
  );
}
