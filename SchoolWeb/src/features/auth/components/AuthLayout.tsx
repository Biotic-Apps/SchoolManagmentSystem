"use client";

import type { ReactNode } from "react";
import { CalendarCheck, MessageSquare, ShieldCheck, Wallet } from "lucide-react";
import { useBranding } from "@/features/branding/api";
import { brandStyle } from "@/features/branding/brand-style";
import { BrandLogo } from "@/features/branding/components/BrandLogo";

interface AuthLayoutProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

const HIGHLIGHTS = [
  { icon: CalendarCheck, text: "Attendance, diary and results in one place" },
  { icon: Wallet, text: "Fees, challans and receipts" },
  { icon: MessageSquare, text: "Parents and teachers stay in touch" },
];

/** Shell for the sign-in, forgot-password and reset-password pages, in the school's branding. */
export function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  const { data: branding } = useBranding(null);
  const schoolName = branding?.schoolName || branding?.appName || "eSchool";

  return (
    <main style={brandStyle(branding?.primaryColor)} className="grid min-h-dvh grid-cols-1 bg-surface lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-[#6A5ACD] to-[#5B4BC7] p-12 text-white lg:flex">
        <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-white/[0.08] blur-sm" />
        <div aria-hidden className="absolute -bottom-32 -left-20 size-96 rounded-full bg-white/[0.05] blur-sm" />
        <div aria-hidden className="absolute right-1/3 top-1/2 size-64 rounded-full bg-accent-pink/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <BrandLogo logoUrl={branding?.logoUrl} size="md" />
          <span className="text-card-title font-semibold">{schoolName}</span>
        </div>
        <div className="relative flex flex-col gap-6">
          <h2 className="text-[32px] font-semibold leading-tight">Your whole school, one simple app.</h2>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-body text-white/90">
                <span className="grid size-9 place-items-center rounded-xl bg-white/[0.12] backdrop-blur-sm ring-1 ring-inset ring-white/[0.08] shadow-[0_2px_8px_rgb(0_0_0/0.1)]">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-1.5 text-caption text-white/80">
          <ShieldCheck className="size-4" />
          Only accounts registered by your school can sign in.
        </p>
      </aside>

      <section className="flex min-w-0 items-center justify-center bg-gradient-to-b from-surface to-background/30 px-4 py-10 sm:px-8">
        <div className="flex w-full max-w-[400px] animate-page-in flex-col gap-6">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandLogo logoUrl={branding?.logoUrl} size="md" />
            <span className="text-card-title font-semibold text-fg">{schoolName}</span>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-[26px] font-semibold leading-8 text-fg">{title}</h1>
            {description && <p className="text-body text-fg-muted">{description}</p>}
          </div>
          {children}
          {footer}
        </div>
      </section>
    </main>
  );
}
