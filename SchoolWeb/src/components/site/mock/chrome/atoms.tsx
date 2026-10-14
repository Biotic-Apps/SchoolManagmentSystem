import { cn } from "@/lib/site/cn";

/*
 * Shared table and panel atoms for the product mocks. Consistent density is
 * what makes these read as software: hairline separation, tabular figures,
 * right-aligned numbers, small uppercase column heads.
 */

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  /** Container-query classes that drop the column on a narrow frame. */
  className?: string;
}) {
  return (
    <th
      className={cn(
        "border-b border-slate-200 px-[0.7em] py-[0.5em] text-[0.7em] font-semibold uppercase tracking-[0.06em] text-slate-400",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  strong = false,
  muted = false,
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  strong?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "truncate border-b border-slate-100 px-[0.7em] py-[0.42em] text-[0.82em]",
        align === "right" && "text-right tabular-nums",
        align === "center" && "text-center",
        strong ? "font-semibold text-slate-900" : muted ? "text-slate-400" : "text-slate-700",
        className,
      )}
    >
      {children}
    </td>
  );
}

export type PillTone = "ok" | "warn" | "danger" | "info" | "neutral";

const PILL_TONES: Record<PillTone, string> = {
  ok: "bg-brand-50 text-brand-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-600",
  info: "bg-sky-50 text-sky-700",
  neutral: "bg-slate-100 text-slate-600",
};

export function Pill({ tone, children }: { tone: PillTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-[0.55em] py-[0.1em] text-[0.9em] font-semibold",
        PILL_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PanelHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-[0.6em] border-b border-slate-200 px-[0.85em] py-[0.55em]">
      <span className="truncate text-[0.85em] font-semibold text-slate-800">{title}</span>
      {meta ? <span className="truncate text-[0.72em] text-slate-400">{meta}</span> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[0.55em] border border-slate-200 bg-white", className)}>
      {children}
    </div>
  );
}

/** A row of segmented filter chips; the first `active` index is filled purple. */
export function Chips({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <>
      {items.map((label, i) => (
        <span
          key={label}
          className={cn(
            "shrink-0 rounded-[0.45em] px-[0.7em] py-[0.38em] text-[0.78em] font-medium",
            i === active
              ? "bg-brand-600 text-white"
              : "border border-slate-200 bg-white text-slate-500",
          )}
        >
          {label}
        </span>
      ))}
    </>
  );
}

/**
 * A strip of summary figures in one bordered panel, divided by hairlines.
 * Cells carry their own hairlines and the wrapper eats the trailing ones, so
 * the panel stays correct at any column count.
 */
export function StatStrip({
  stats,
  narrowCols = 2,
  className,
}: {
  stats: Array<{ label: string; value: string; note?: string; tone?: string }>;
  /** Columns on the narrowest frame; short figures can afford four. */
  narrowCols?: 2 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        narrowCols === 4 ? "grid-cols-4" : "grid-cols-2",
        "-mb-px -mr-px grid overflow-hidden rounded-[0.55em] border border-slate-200 bg-white",
        className,
      )}
    >
      {stats.map((s) => (
        <div key={s.label} className="min-w-0 border-b border-r border-slate-200 px-[0.8em] py-[0.6em]">
          <p className="truncate text-[0.7em] font-medium uppercase tracking-[0.06em] text-slate-400">
            {s.label}
          </p>
          <p className={cn("mt-[0.12em] truncate text-[1.05em] font-bold tabular-nums", s.tone ?? "text-slate-900")}>
            {s.value}
          </p>
          {s.note ? <p className="truncate text-[0.68em] text-slate-400">{s.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
