"use client";

import { Check } from "lucide-react";
import { HOW_COPY } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { useLoopStep } from "./useLoopStep";

/** Step 1: the one setup form, its fields ticking themselves off in turn. */
export function SetupChecklist() {
  const items = HOW_COPY.setupItems;
  const { ref, step } = useLoopStep(items.length);
  const ticks = Math.min(step, items.length);

  return (
    <div
      ref={ref}
      aria-hidden
      className="rounded-xl border border-line bg-white p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-faint">
          School setup
        </span>
        <span className="text-[0.7rem] font-semibold tabular-nums text-brand-700">
          {ticks}/{items.length}
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-field">
        <div
          className="h-full origin-left rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${ticks / items.length})` }}
        />
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const ticked = i < step;
          return (
            <li key={item} className="flex items-center gap-2.5 text-[0.82rem]">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-md border transition-colors duration-300",
                  ticked
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-line-strong bg-white",
                )}
              >
                <Check
                  className={cn(
                    "size-3 transition-transform duration-300",
                    ticked ? "scale-100" : "scale-0",
                  )}
                  strokeWidth={3}
                />
              </span>
              <span
                className={cn(
                  "transition-colors",
                  ticked ? "text-foreground" : "text-faint",
                )}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
