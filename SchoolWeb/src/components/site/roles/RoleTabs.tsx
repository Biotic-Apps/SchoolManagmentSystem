"use client";

import { motion } from "framer-motion";
import { ROLE_PORTALS, ROLE_PORTALS_COPY } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { ROLE_ICONS } from "./roleIcons";

type RoleTabsProps = {
  active: number;
  ticking: boolean;
  interval: number;
  onPick: (index: number) => void;
};

/**
 * The desktop list of roles. The active card's fill is one shared element
 * that glides between rows (`layoutId`), and a hairline along its bottom
 * fills over the auto-advance interval so the reader can see what is coming.
 */
export function RoleTabs({ active, ticking, interval, onPick }: RoleTabsProps) {
  return (
    <div role="tablist" aria-orientation="vertical" aria-label={ROLE_PORTALS_COPY.listLabel} className="hidden flex-col gap-1.5 lg:flex">
      {ROLE_PORTALS.map((role, index) => {
        const Icon = ROLE_ICONS[role.id];
        const selected = index === active;
        return (
          <button
            key={role.id}
            type="button"
            role="tab"
            id={`role-tab-${role.id}`}
            aria-selected={selected}
            aria-controls="role-panel"
            onClick={() => onPick(index)}
            className={cn(
              "group relative isolate flex items-center gap-3.5 overflow-hidden rounded-2xl px-4 py-3 text-left transition-colors duration-200",
              selected ? "text-foreground" : "text-muted hover:bg-surface hover:text-foreground",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="role-portal-active"
                aria-hidden
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-2xl bg-surface shadow-[0_10px_30px_-18px_rgb(91_75_199/0.55)] ring-1 ring-brand-200"
              />
            ) : null}
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                selected ? "gradient-button text-white" : "bg-surface-sunken text-brand-600 ring-1 ring-line",
              )}
            >
              <Icon aria-hidden className="size-[1.15rem]" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.95rem] font-semibold">{role.name}</span>
              <span className="block truncate text-[0.82rem] text-faint">{role.line}</span>
            </span>
            {selected && ticking ? (
              <motion.span
                key={`bar-${index}`}
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: interval / 1000, ease: "linear" }}
                className="absolute inset-x-4 bottom-0 h-0.5 origin-left rounded-full bg-brand-400"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
