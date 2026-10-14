"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { ScreenMock } from "@/components/site/mock/ScreenMock";
import { ROLE_PORTALS, ROLE_PORTALS_COPY } from "@/lib/site/content";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The right-hand stage: a browser window showing the screen that role lands
 * on, crossfading and sliding as the role changes, with what that role can
 * do listed underneath, each line arriving a beat after the last.
 */
export function RolePreview({ active }: { active: number }) {
  const reduced = useReducedMotion();
  const role = ROLE_PORTALS[active];
  const shift = reduced ? 0 : 24;

  return (
    <div id="role-panel" role="tabpanel" aria-label={role.name} className="min-w-0">
      <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-[var(--shadow-device)]">
        <div className="flex items-center gap-2 border-b border-line bg-surface-sunken px-3 py-2.5 sm:px-4">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-brand-400" />
          </div>
          <div className="mx-auto flex max-w-[62%] items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[0.62rem] text-faint ring-1 ring-line sm:text-[0.7rem]">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand-500" />
            <span className="truncate">{role.url}</span>
          </div>
        </div>
        <div aria-hidden className="relative aspect-[16/10] w-full overflow-hidden bg-white [contain:content]">
          <AnimatePresence initial={false}>
            <motion.div
              key={role.id}
              className="absolute inset-0"
              initial={{ opacity: 0, x: shift }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -shift }}
              transition={{ duration: reduced ? 0.01 : 0.55, ease: EASE }}
            >
              <ScreenMock variant={role.screen} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-brand-600">
            {ROLE_PORTALS_COPY.canDo}
          </p>
          <ul key={role.id} className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {role.points.map((point, index) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0.01 : 0.45, delay: reduced ? 0 : 0.12 + index * 0.07, ease: EASE }}
                className="flex items-start gap-2.5 text-[0.93rem] leading-snug text-foreground"
              >
                <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-200">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {point}
              </motion.li>
            ))}
          </ul>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-accent-50 px-3 py-1.5 text-[0.78rem] font-semibold text-accent-700 ring-1 ring-accent-200">
          <ShieldCheck aria-hidden className="size-3.5" strokeWidth={2.2} />
          {ROLE_PORTALS_COPY.scopeChip}
        </span>
      </div>
    </div>
  );
}
