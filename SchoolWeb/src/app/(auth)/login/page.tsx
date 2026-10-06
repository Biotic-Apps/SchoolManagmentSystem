import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPanel } from "@/features/auth/components/LoginPanel";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPanel />
    </Suspense>
  );
}
