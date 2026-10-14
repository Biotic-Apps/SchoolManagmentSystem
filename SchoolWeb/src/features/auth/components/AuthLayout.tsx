"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBranding } from "@/features/branding/api";
import { brandStyle } from "@/features/branding/brand-style";
import { BrandLogo } from "@/features/branding/components/BrandLogo";
import "@/app/styles/auth.css";
import { AuthBrandPanel } from "./AuthBrandPanel";

interface AuthLayoutProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/** Shell for the sign-in, forgot-password and reset-password pages, in the school's branding. */
export function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  const { data: branding } = useBranding(null);
  const schoolName = branding?.schoolName || branding?.appName || "eSchool";

  return (
    <main style={brandStyle(branding?.primaryColor)} className="grid min-h-dvh grid-cols-1 bg-white lg:grid-cols-[1fr_1.1fr]">
      <AuthBrandPanel schoolName={schoolName} logoUrl={branding?.logoUrl} />

      <section className="relative isolate flex min-w-0 flex-col overflow-hidden bg-white px-4 py-6 sm:px-8 lg:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 -z-10 size-80 rounded-full bg-card-bg/70 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-72 rounded-full bg-selected/60 blur-3xl lg:hidden" />

        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-label font-medium text-fg-muted transition-colors duration-(--dur-quick) hover:bg-selected hover:text-on-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ArrowLeft className="size-4 transition-transform duration-(--dur-quick) group-hover:-translate-x-0.5" aria-hidden />
          Back to home
        </Link>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="flex w-full max-w-[400px] animate-page-in flex-col gap-6">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandLogo logoUrl={branding?.logoUrl} size="md" />
              <span className="text-card-title font-semibold text-fg">{schoolName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-[26px] font-semibold leading-8 tracking-tight text-fg">{title}</h1>
              {description && <p className="text-body text-fg-muted">{description}</p>}
            </div>
            {children}
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}
