"use client";

import { motion } from "framer-motion";
import { MODULES_COPY } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";

export type RoleFilterId = (typeof MODULES_COPY.filters)[number]["id"];

type RoleFilterProps = {
  value: RoleFilterId;
  counts: Record<RoleFilterId, number>;
  onChange: (next: RoleFilterId) => void;
};

/**
 * The chips above the module grid. The active chip's purple fill is a single
 * shared element that glides between chips (`layoutId`), rather than each chip
 * fading its own background in and out.
 */
export function RoleFilter({ value, counts, onChange }: RoleFilterProps) {
  return (
    <div
      role="group"
      aria-label={MODULES_COPY.filterLabel}
      className="flex flex-wrap gap-2"
    >
      {MODULES_COPY.filters.map((filter) => {
        const active = filter.id === value;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
            className={cn(
              "relative isolate inline-flex h-10 items-center gap-2 rounded-full px-4 text-[0.86rem] font-semibold transition-colors duration-200",
              active
                ? "text-white"
                : "bg-surface text-muted ring-1 ring-inset ring-line hover:text-foreground hover:ring-brand-200",
            )}
          >
            {active ? (
              <motion.span
                layoutId="module-filter-pill"
                aria-hidden
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="gradient-button absolute inset-0 -z-10 rounded-full shadow-[0_8px_20px_-10px_rgb(91_75_199/0.9)]"
              />
            ) : null}
            {filter.label}
            <span
              className={cn(
                "grid min-w-5 place-items-center rounded-full px-1.5 text-[0.68rem] tabular-nums",
                active ? "bg-white/20 text-white" : "bg-surface-sunken text-faint",
              )}
            >
              {counts[filter.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
