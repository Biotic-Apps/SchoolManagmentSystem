import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { EMPTY_VALUE } from "@/lib/format";
import { AnimatedNumber } from "./AnimatedNumber";
import { IconTile, type IconTileTone } from "./IconTile";

interface StatCardProps {
  label: string;
  value?: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: IconTileTone;
  loading?: boolean;
  /** Hover lift — only for tiles wrapped in a link/button. */
  interactive?: boolean;
  className?: string;
}

/** KPI tile: icon tile + label, a large value (eases only when it changes), and an optional secondary line. */
export function StatCard({ label, value, hint, icon, tone = "primary", loading, interactive, className }: StatCardProps) {
  return (
    <Card interactive={interactive} className={cn("flex h-full flex-col gap-4 p-5 sm:p-6", className)}>
      <div className="flex items-center gap-3">
        {icon && <IconTile icon={icon} tone={tone} />}
        <span className="min-w-0 text-label font-medium text-fg-muted">{label}</span>
      </div>
      <div className="flex flex-col gap-1">
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <span className="text-[28px] font-bold leading-9 tracking-[-0.02em] text-fg tabular-nums sm:text-[30px]">
            {value === undefined || value === null ? EMPTY_VALUE : <AnimatedNumber value={value} />}
          </span>
        )}
        {hint && <span className="text-caption text-fg-muted">{hint}</span>}
      </div>
    </Card>
  );
}
