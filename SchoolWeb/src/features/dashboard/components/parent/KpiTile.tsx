import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { IconTile, type IconTileTone } from "@/components/shared/IconTile";
import { Card } from "@/components/ui/Card";

interface KpiTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: IconTileTone;
  /** Whole tile opens this page. */
  href?: string | null;
  /** Action under the figures (e.g. download challan). */
  footer?: ReactNode;
}

/** Parent KPI: icon, label, a large figure, a detail line and an optional action. */
export function KpiTile({ label, value, hint, icon, tone = "primary", href, footer }: KpiTileProps) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        <IconTile icon={icon} tone={tone} size="sm" className="sm:size-10" />
        <span className="min-w-0 text-label font-medium text-fg-muted">{label}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[22px] font-semibold leading-8 tracking-[-0.02em] text-fg tabular-nums sm:text-[28px] sm:leading-9">
          <AnimatedNumber value={value} />
        </span>
        {hint && <span className="text-caption text-fg-muted">{hint}</span>}
      </div>
    </>
  );
  return (
    <Card interactive={!!href && !footer} className="relative flex h-full flex-col gap-3 p-4 sm:gap-4 sm:p-5">
      {href && !footer ? (
        <Link href={href} className="flex flex-col gap-3 outline-none sm:gap-4 after:absolute after:inset-0 after:rounded-card">
          {body}
        </Link>
      ) : (
        body
      )}
      {footer && <div className="mt-auto">{footer}</div>}
    </Card>
  );
}
