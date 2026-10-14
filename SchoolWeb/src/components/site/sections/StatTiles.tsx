import {
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { CountUp } from "@/components/site/motion/CountUp";
import { Sparkline } from "@/components/site/motion/Sparkline";
import { IconTile } from "@/components/site/ui/IconTile";
import { STATS_COPY, STAT_TILES, type StatTile } from "@/lib/site/content";

const ICONS: Record<StatTile["icon"], LucideIcon> = {
  students: GraduationCap,
  attendance: CalendarCheck,
  fees: Wallet,
  approvals: ClipboardCheck,
  staff: BriefcaseBusiness,
  homework: BookOpen,
};

/** The sparkline wears its tile's colour. Written out so Tailwind keeps them. */
const LINE: Record<StatTile["tone"], string> = {
  indigo: "text-tile-indigo",
  rose: "text-tile-rose",
  blue: "text-tile-blue",
  sky: "text-tile-sky",
  violet: "text-tile-violet",
};

/**
 * The six figures the principal's dashboard opens with.
 *
 * Rendered as one bordered panel divided by hairlines rather than six floating
 * cards — the same shape the portal uses. A page of separate tiles reads as
 * decoration; a single divided panel reads as a report.
 */
export function StatTiles() {
  return (
    <Section id="features" tone="sunken">
      <SectionHeading
        eyebrow={STATS_COPY.eyebrow}
        title={STATS_COPY.title}
        body={STATS_COPY.body}
      />

      <Reveal delay={0.12}>
        <div className="panel mt-12 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
            <h3 className="text-[0.95rem] font-semibold tracking-tight">{STATS_COPY.panelTitle}</h3>
            <p className="text-[0.78rem] tabular-nums text-faint">{STATS_COPY.panelMeta}</p>
          </div>

          {/* Every cell draws its own bottom and right hairline and the wrapper
              eats the trailing ones, so no rule contradicts another at any
              column count. */}
          <div className="-mb-px -mr-px grid sm:grid-cols-2 lg:grid-cols-3">
            {STAT_TILES.map((tile, index) => {
              const Icon = ICONS[tile.icon];
              return (
                <div
                  key={tile.label}
                  className="flex items-start gap-3.5 border-b border-r border-line p-4 sm:gap-4 sm:p-6"
                >
                  <IconTile tone={tile.tone} delay={index * 0.07}>
                    <Icon className="size-[1.35rem]" strokeWidth={2.1} />
                  </IconTile>

                  <div className="min-w-0 flex-1">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-faint">
                      {tile.label}
                    </p>

                    <div className="mt-1.5 flex items-end justify-between gap-3">
                      <p className="whitespace-nowrap text-[1.45rem] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-[1.7rem]">
                        {tile.prefix && (
                          <span className="text-[0.6em] font-medium text-faint">{tile.prefix}</span>
                        )}
                        <CountUp value={tile.value} decimals={tile.decimals} />
                        {tile.suffix && (
                          <span className="text-[0.6em] font-medium text-faint">{tile.suffix}</span>
                        )}
                      </p>
                      <Sparkline
                        points={tile.trend}
                        delay={0.2 + index * 0.07}
                        className={`h-7 w-14 shrink-0 sm:h-8 sm:w-24 ${LINE[tile.tone]}`}
                      />
                    </div>

                    <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">{tile.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="mt-5 text-[0.82rem] text-faint">{STATS_COPY.disclaimer}</p>
      </Reveal>
    </Section>
  );
}
