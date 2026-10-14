import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/LandingPage";
import { SESSION_COOKIE } from "@/lib/auth-cookie-names";

export const metadata: Metadata = {
  title: { absolute: "eSchool — School management made simple" },
  description:
    "Admissions, attendance, diary, exams, fees, payroll and parent messaging in one web portal and Android app.",
};

/** Public home page. Signed-in users go straight to their dashboard. */
export default async function RootPage() {
  if ((await cookies()).has(SESSION_COOKIE)) redirect("/dashboard");
  return <LandingPage />;
}
