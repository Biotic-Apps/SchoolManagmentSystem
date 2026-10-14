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
    <main
      style={brandStyle(branding?.primaryColor)}
      className="grid min-h-dvh grid-cols-1 overflow-x-hidden bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
    >
      <AuthBrandPanel schoolName={schoolName} logoUrl={branding?.logoUrl} />

      <section className="relative isolate flex min-w-0 flex-col bg-background px-4 py-5 sm:px-8 lg:px-10 lg:py-8">
        {/* Phones/tablets: no side panel, just a soft lavender wash behind the top of the page. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-selected/70 to-transparent lg:hidden" />

        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-label font-medium text-fg-muted transition-colors duration-(--dur-quick) hover:bg-selected hover:text-on-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ArrowLeft className="size-4 transition-transform duration-(--dur-quick) group-hover:-translate-x-0.5" aria-hidden />
          Back to home
        </Link>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="flex w-full max-w-[420px] animate-page-in flex-col gap-6">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandLogo logoUrl={branding?.logoUrl} size="md" className="shadow-sm" />
              <span className="text-card-title font-semibold text-fg">{schoolName}</span>
            </div>
            <header className="flex flex-col gap-1.5">
              <h1 className="text-page-title font-semibold tracking-tight text-fg">{title}</h1>
              {description && <p className="text-body text-fg-muted">{description}</p>}
            </header>
            {children}
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}
