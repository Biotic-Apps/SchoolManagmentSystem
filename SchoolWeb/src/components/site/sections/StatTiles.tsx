import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { AttendanceRing } from "@/components/site/stats/AttendanceRing";
import { BentoCard } from "@/components/site/stats/BentoCard";
import { LiveTicker } from "@/components/site/stats/LiveTicker";
import { StatCard } from "@/components/site/stats/StatCard";
import { STATS_COPY, STAT_TILES } from "@/lib/site/content";

const ring = STAT_TILES.find((tile) => tile.icon === "attendance") ?? STAT_TILES[0];
const counted = STAT_TILES.filter((tile) => tile !== ring);
const lead = counted.slice(0, 4);
const tail = counted.slice(4);

/**
 * The principal's morning figures as a bento: attendance as a drawn ring in
 * the big cell, the other counts around it, and a live feed of what just
 * happened across the school along the bottom.
 */
export function StatTiles() {
  return (
    <Section id="at-a-glance" tone="sunken">
      <SectionHeading eyebrow={STATS_COPY.eyebrow} title={STATS_COPY.title} body={STATS_COPY.body} />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoCard index={0} className="sm:col-span-2 lg:row-span-2">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[0.95rem] font-semibold tracking-tight">{STATS_COPY.ringTitle}</h3>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.7rem] font-medium text-brand-700">
                {STATS_COPY.panelTitle}
              </span>
            </div>
            <div className="mt-6 grid flex-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <AttendanceRing value={ring.value} label={STATS_COPY.ringUnit} />
              <div>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                  {[
                    { label: STATS_COPY.ringPresent, value: STATS_COPY.ringPresentValue, dot: "bg-brand-500" },
                    { label: STATS_COPY.ringAbsent, value: STATS_COPY.ringAbsentValue, dot: "bg-accent-500" },
                  ].map((row) => (
                    <div key={row.label} className="rounded-xl bg-surface-sunken px-3.5 py-3">
                      <dt className="flex items-center gap-2 text-[0.75rem] text-muted">
                        <span className={`size-2 rounded-full ${row.dot}`} />
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-[1.3rem] font-semibold tabular-nums tracking-tight">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[0.82rem] leading-relaxed text-muted">{STATS_COPY.ringCaption}</p>
              </div>
            </div>
          </div>
        </BentoCard>

        {lead.map((tile, i) => (
          <BentoCard key={tile.label} index={i + 1}>
            <StatCard tile={tile} index={i + 1} />
          </BentoCard>
        ))}

        {tail.map((tile, i) => (
          <BentoCard key={tile.label} index={i + 5}>
            <StatCard tile={tile} index={i + 5} />
          </BentoCard>
        ))}

        <BentoCard index={6} className="sm:col-span-2 lg:col-span-3">
          <div className="grid h-full gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-[0.95rem] font-semibold tracking-tight">{STATS_COPY.tickerTitle}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2 py-0.5 text-[0.68rem] font-semibold text-accent-700">
                  <span className="size-1.5 animate-pulse rounded-full bg-accent-500" />
                  {STATS_COPY.tickerLive}
                </span>
              </div>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-faint">{STATS_COPY.panelMeta}</p>
            </div>
            <LiveTicker />
          </div>
        </BentoCard>
      </div>

      <Reveal delay={0.2}>
        <p className="mt-5 text-[0.82rem] text-faint">{STATS_COPY.disclaimer}</p>
      </Reveal>
    </Section>
  );
}
