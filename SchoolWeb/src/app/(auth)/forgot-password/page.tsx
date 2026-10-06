import type { Metadata } from "next";
import { ForgotPasswordPanel } from "@/features/auth/components/ForgotPasswordPanel";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordPanel />;
}
