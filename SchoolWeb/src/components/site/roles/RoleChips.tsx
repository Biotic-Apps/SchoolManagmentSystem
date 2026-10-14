"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ROLE_PORTALS, ROLE_PORTALS_COPY } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { ROLE_ICONS } from "./roleIcons";

type RoleChipsProps = { active: number; onPick: (index: number) => void };

/**
 * Phones and tablets: the roles as one swipeable row of chips. The row keeps
 * the active chip in view by moving its own `scrollLeft`, never the page.
 */
export function RoleChips({ active, onPick }: RoleChipsProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.children[active] as HTMLElement | undefined;
    if (!row || !chip) return;
    const target = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  return (
    <div
      ref={rowRef}
      role="tablist"
      aria-label={ROLE_PORTALS_COPY.listLabel}
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden"
    >
      {ROLE_PORTALS.map((role, index) => {
        const Icon = ROLE_ICONS[role.id];
        const selected = index === active;
        return (
          <button
            key={role.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="role-panel"
            onClick={() => onPick(index)}
            className={cn(
              "relative isolate inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[0.86rem] font-semibold transition-colors duration-200",
              selected ? "text-white" : "bg-surface text-muted ring-1 ring-inset ring-line",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="role-chip-active"
                aria-hidden
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="gradient-button absolute inset-0 -z-10 rounded-full"
              />
            ) : null}
            <Icon aria-hidden className="size-4" strokeWidth={2} />
            {role.name}
          </button>
        );
      })}
    </div>
  );
}
