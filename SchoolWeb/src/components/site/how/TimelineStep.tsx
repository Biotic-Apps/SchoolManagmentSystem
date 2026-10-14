import type { ReactNode } from "react";
import { cn } from "@/lib/site/cn";

type TimelineStepProps = {
  step: string;
  title: string;
  body: string;
  /** Even steps sit left of the centre line on large screens, odd ones right. */
  index: number;
  visual: ReactNode;
};

/**
 * One stop on the timeline: the numbered node that sits on the line, and the
 * card beside it. The `data-*` hooks are what `useTimelineScroll` animates.
 */
export function TimelineStep({
  step,
  title,
  body,
  index,
  visual,
}: TimelineStepProps) {
  const left = index % 2 === 0;

  return (
    <li
      data-step
      className="relative pl-16 lg:grid lg:grid-cols-2 lg:gap-x-28 lg:pl-0 lg:[&+&]:-mt-28"
    >
      {/* The node, centred on the line: left gutter on mobile, centre on lg. */}
      <span
        data-node
        className="absolute left-6 top-6 z-10 grid size-12 -translate-x-1/2 place-items-center lg:left-1/2"
      >
        <span
          data-ring
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 opacity-0"
        />
        <span
          data-dot
          className="relative grid size-12 place-items-center rounded-full bg-white text-[0.8rem] font-bold tabular-nums text-brand-700 shadow-[0_0_0_6px_white] ring-1 ring-line-strong"
        >
          {step}
        </span>
      </span>

      <div
        data-card
        data-side={left ? "left" : "right"}
        className={cn(
          "rounded-[1.4rem] border border-line bg-white p-6 shadow-[var(--shadow-lift)] sm:p-7",
          left ? "lg:col-start-1" : "lg:col-start-2",
        )}
      >
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-600">
          Step {step}
        </p>
        <h3 className="mt-2 text-[1.2rem] font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-3 text-pretty text-[0.95rem] leading-relaxed text-muted">
          {body}
        </p>
        <div className="mt-6">{visual}</div>
      </div>
    </li>
  );
}
