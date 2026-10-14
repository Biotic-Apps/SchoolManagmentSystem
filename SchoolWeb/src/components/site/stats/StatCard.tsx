import {
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { CountUp } from "@/components/site/motion/CountUp";
import { Sparkline } from "@/components/site/motion/Sparkline";
import type { StatTile } from "@/lib/site/content";

export const STAT_ICONS: Record<StatTile["icon"], LucideIcon> = {
  students: GraduationCap,
  attendance: CalendarCheck,
  fees: Wallet,
  approvals: ClipboardCheck,
  staff: BriefcaseBusiness,
  homework: BookOpen,
};

/** One counted figure in the bento: label, number, a seven-day trend and a caption. */
export function StatCard({ tile, index }: { tile: StatTile; index: number }) {
  const Icon = STAT_ICONS[tile.icon];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 text-brand-700 ring-1 ring-brand-100">
          <Icon className="size-[1.1rem]" strokeWidth={2.1} />
        </span>
        <Sparkline points={tile.trend} delay={0.3 + index * 0.08} className="h-7 w-20 text-brand-500" />
      </div>

      <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-faint">{tile.label}</p>
      <p className="mt-1.5 whitespace-nowrap text-[1.7rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-foreground sm:text-[1.95rem]">
        {tile.prefix ? <span className="mr-0.5 text-[0.55em] font-medium text-faint">{tile.prefix}</span> : null}
        <CountUp value={tile.value} decimals={tile.decimals} />
        {tile.suffix ? <span className="text-[0.55em] font-medium text-faint">{tile.suffix}</span> : null}
      </p>
      <p className="mt-auto pt-3 text-[0.8rem] leading-relaxed text-muted">{tile.caption}</p>
    </div>
  );
}
