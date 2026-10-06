"use client";

import { useBranding } from "@/features/branding/api";
import { BrandMark } from "@/features/branding/components/BrandMark";
import { useSessionSchoolId } from "@/features/branding/use-session-school-id";

/** School logo and name from /branding; hidden until the school has a name to show. */
export function TopbarBrand() {
  const { data: branding } = useBranding(useSessionSchoolId());
  if (!branding?.schoolName) return null;
  return <BrandMark name={branding.schoolName} logoUrl={branding.logoUrl} className="hidden md:flex" />;
}
