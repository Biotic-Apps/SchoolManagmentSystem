import { cn } from "@/lib/cn";
import { BrandLogo } from "./BrandLogo";

interface BrandMarkProps {
  name: string;
  logoUrl?: string | null;
  subtitle?: string;
  /** Hide the name/subtitle on small screens (logo only). */
  compact?: boolean;
  className?: string;
}

/** School logo (or the app mark) with the school name; used in the top bar. */
export function BrandMark({ name, logoUrl, subtitle, compact, className }: BrandMarkProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <BrandLogo logoUrl={logoUrl} />
      <span className={cn("min-w-0 flex-col leading-tight", compact ? "hidden md:flex" : "flex")}>
        <span className="truncate text-body font-semibold text-fg">{name}</span>
        {subtitle && <span className="text-caption text-fg-muted">{subtitle}</span>}
      </span>
    </div>
  );
}
