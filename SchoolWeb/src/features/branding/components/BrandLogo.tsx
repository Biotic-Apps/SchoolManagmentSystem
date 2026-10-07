import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/cn";

interface BrandLogoProps {
  logoUrl?: string | null;
  size?: "md" | "lg";
  className?: string;
}

const BOX = { md: "size-10", lg: "size-14" } as const;
const ICON = { md: "size-5", lg: "size-7" } as const;

/** The school's logo, or the app's graduation-cap mark on the primary colour. */
export function BrandLogo({ logoUrl, size = "md", className }: BrandLogoProps) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed storage URL
      <img
        src={logoUrl}
        alt=""
        className={cn(BOX[size], "shrink-0 rounded-input border border-border bg-surface object-contain", className)}
      />
    );
  }
  return (
    <span className={cn(BOX[size], "grid shrink-0 place-items-center rounded-input bg-primary text-on-primary", className)}>
      <GraduationCap className={ICON[size]} />
    </span>
  );
}
