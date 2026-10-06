import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordPanel } from "@/features/auth/components/ResetPasswordPanel";

export const metadata: Metadata = { title: "Reset password", referrer: "no-referrer" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPanel />
    </Suspense>
  );
}
