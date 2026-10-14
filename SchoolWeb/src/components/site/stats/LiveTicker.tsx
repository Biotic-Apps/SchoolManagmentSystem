"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Award,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { STATS_TICKER } from "@/lib/site/content";

type Kind = (typeof STATS_TICKER)[number]["kind"];

const ICONS: Record<Kind, LucideIcon> = {
  attendance: CalendarCheck,
  fees: Wallet,
  results: Award,
  homework: BookOpen,
  admissions: UserPlus,
  messages: MessageSquare,
};

const VISIBLE = 3;
const STEP_MS = 2600;

/**
 * A feed of the school's latest events. Every few seconds the newest slides
 * up from the bottom and the oldest lifts out of the top. It only runs while
 * on screen, and under reduced motion it holds the first few events still.
 */
export function LiveTicker() {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const timer = window.setInterval(() => setTick((t) => t + 1), STEP_MS);
    return () => window.clearInterval(timer);
  }, [inView, reduced]);

  const rows = Array.from({ length: VISIBLE }, (_, i) => {
    const serial = tick + i;
    return { serial, event: STATS_TICKER[serial % STATS_TICKER.length] };
  });

  return (
    <ul ref={ref} className="relative flex flex-col gap-2 overflow-hidden" aria-live="off">
      <AnimatePresence initial={false} mode="popLayout">
        {rows.map(({ serial, event }, i) => {
          const Icon = ICONS[event.kind];
          const newest = i === VISIBLE - 1;
          return (
            <motion.li
              key={serial}
              layout
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface-sunken/60 px-3 py-2.5"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <Icon className="size-4" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.84rem] font-medium text-foreground">{event.text}</span>
                <span className="block truncate text-[0.72rem] text-faint">{event.meta}</span>
              </span>
              {newest ? <span className="size-1.5 shrink-0 rounded-full bg-accent-500" /> : null}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
