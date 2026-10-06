"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useBranding } from "@/features/branding/api";
import { brandStyle } from "@/features/branding/brand-style";
import { BrandMark } from "@/features/branding/components/BrandMark";

interface AuthLayoutProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/** Shell for the sign-in, forgot-password and reset-password pages, in the school's branding. */
export function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  const { data: branding } = useBranding(null);

  return (
    <main
      style={brandStyle(branding?.primaryColor)}
      className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-4 py-12"
    >
      <BrandMark
        name={branding?.schoolName || branding?.appName || "eSchool"}
        logoUrl={branding?.logoUrl}
        subtitle="School Management System"
        className="max-w-[420px]"
      />
      <Card className="w-full max-w-[420px]">
        <CardHeader className="px-8 pt-8">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-6">{children}</CardContent>
      </Card>
      {footer}
    </main>
  );
}
