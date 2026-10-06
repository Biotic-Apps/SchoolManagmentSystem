import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/cn";

interface BrandMarkProps {
  name: string;
  logoUrl?: string | null;
  subtitle?: string;
  className?: string;
}

/** School logo (or the app mark) with the school name; used on login and in the top bar. */
export function BrandMark({ name, logoUrl, subtitle, className }: BrandMarkProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed storage URL
        <img src={logoUrl} alt="" className="size-10 shrink-0 rounded-input border border-border bg-surface object-contain" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-input bg-primary text-on-primary">
          <GraduationCap className="size-5" />
        </span>
      )}
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-body font-semibold text-fg">{name}</span>
        {subtitle && <span className="text-caption text-fg-muted">{subtitle}</span>}
      </span>
    </div>
  );
}
