"use client";

import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useBranding } from "@/features/branding/api";
import { brandStyle } from "@/features/branding/brand-style";
import { BrandLogo } from "@/features/branding/components/BrandLogo";

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
      className="flex min-h-dvh flex-col items-center justify-center bg-background bg-[radial-gradient(900px_520px_at_50%_-8%,#dcf1ec,transparent_65%)] px-4 py-10"
    >
      <div className="flex w-full max-w-[420px] animate-page-in flex-col items-center gap-6">
        <Card className="w-full overflow-hidden rounded-[18px] shadow-lg">
          <div aria-hidden className="h-1 bg-primary" />
          <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center sm:px-8">
            <BrandLogo logoUrl={branding?.logoUrl} size="lg" />
            <div className="flex flex-col gap-0.5">
              <p className="text-card-title font-semibold text-fg">{schoolName}</p>
              <p className="text-caption text-fg-muted">School Management System</p>
            </div>
          </div>
          <div className="mx-6 mt-6 border-t border-border sm:mx-8" />
          <div className="flex flex-col gap-1 px-6 pt-6 sm:px-8">
            <h1 className="text-[20px] font-semibold leading-7 text-fg">{title}</h1>
            {description && <p className="text-label text-fg-muted">{description}</p>}
          </div>
          <div className="px-6 pb-8 pt-5 sm:px-8">{children}</div>
        </Card>
        {footer}
        <p className="flex items-center gap-1.5 text-caption text-fg-muted">
          <ShieldCheck className="size-4 text-primary" />
          Only accounts registered by your school can sign in.
        </p>
      </div>
    </main>
  );
}
