import {
  Award,
  BarChart3,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  FileCheck,
  HeartPulse,
  Landmark,
  MessageSquare,
  MessageSquareWarning,
  NotebookPen,
  Package,
  Receipt,
  Smartphone,
  Square,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { MODULES, MODULES_COPY, type ModuleEntry } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";

const TONES: Record<ModuleEntry["tone"], string> = {
  purple: "text-brand-600",
  indigo: "text-tile-indigo",
  rose: "text-tile-rose",
  blue: "text-tile-blue",
  sky: "text-tile-sky",
  violet: "text-tile-violet",
};

/**
 * Named explicitly rather than looked up off the namespace.
 *
 * This used to be `import * as Icons from "lucide-react"` and a string index.
 * A namespace import pulls the whole barrel — every icon in the library — and
 * is the one shape Next's `optimizePackageImports` cannot rewrite, so the entire
 * set was being walked at build time to render eighteen of them. The map also
 * turns an unknown `icon` string into a type error instead of a silent square.
 */
const ICONS: Record<ModuleEntry["icon"], LucideIcon> = {
  ClipboardList,
  Users,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  NotebookPen,
  FileCheck,
  Award,
  Receipt,
  Wallet,
  Landmark,
  Package,
  MessageSquare,
  MessageSquareWarning,
  HeartPulse,
  BarChart3,
  UserRound,
  Smartphone,
};

function ModuleRow({ entry }: { entry: ModuleEntry }) {
  const Icon = ICONS[entry.icon] ?? Square;
  const isSoon = entry.status === "soon";

  return (
    <div
      className={cn(
        "group flex items-start gap-3.5 border-b border-r border-line p-5 transition-colors",
        isSoon ? "bg-surface-sunken/40" : "hover:bg-surface-sunken/60",
      )}
    >
      <Icon
        className={cn("mt-0.5 size-[1.15rem] shrink-0", isSoon ? "text-faint" : TONES[entry.tone])}
        strokeWidth={2}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn(
              "text-[0.95rem] font-semibold tracking-tight",
              isSoon && "text-muted",
            )}
          >
            {entry.name}
          </h3>
          {isSoon ? (
            <span className="rounded px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-faint ring-1 ring-inset ring-line">
              {MODULES_COPY.soon}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[0.84rem] leading-relaxed text-muted">{entry.detail}</p>
      </div>
    </div>
  );
}

/**
 * The full module map as one dense grid.
 *
 * Eighteen separate cards would have been eighteen more tiles on a page that
 * already has plenty. Inside a single bordered panel, split by hairlines, the
 * same list reads as a specification — which is what a principal is actually
 * scanning it for.
 */
export function Modules() {
  const live = MODULES.filter((m) => m.status === "live");
  const soon = MODULES.filter((m) => m.status === "soon");

  return (
    <Section id="modules" tone="sunken">
      <SectionHeading
        eyebrow={MODULES_COPY.eyebrow}
        title={MODULES_COPY.title}
        body={MODULES_COPY.body}
      />

      <Reveal delay={0.12}>
        {/* The negative right/bottom margin hides the trailing hairlines the
            cells draw, so the grid never doubles up on the panel's own edge. */}
        <div className="panel mt-12 shadow-[var(--shadow-card)]">
          <div className="-mb-px -mr-px grid sm:grid-cols-2 lg:grid-cols-3">
            {live.map((entry) => (
              <ModuleRow key={entry.name} entry={entry} />
            ))}
            {/* A row the module count does not fill would leave the bottom rule
                stopping short and the panel finishing on a ragged corner. Inert
                cells carry the hairline to the edge, one set per breakpoint. */}
            {Array.from({ length: (2 - (live.length % 2)) % 2 }, (_, i) => (
              <div key={`sm-${i}`} aria-hidden className="hidden border-b border-line sm:block lg:hidden" />
            ))}
            {Array.from({ length: (3 - (live.length % 3)) % 3 }, (_, i) => (
              <div key={`lg-${i}`} aria-hidden className="hidden border-b border-line lg:block" />
            ))}
          </div>

          {soon.length > 0 ? (
            <>
              <div className="flex items-center gap-3 border-t border-line bg-surface-sunken/60 px-5 py-3">
                <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
                  {MODULES_COPY.onTheWay}
                </h3>
              </div>

              <div className="-mb-px -mr-px grid sm:grid-cols-2 lg:grid-cols-4">
                {soon.map((entry) => (
                  <ModuleRow key={entry.name} entry={entry} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </Reveal>
    </Section>
  );
}
