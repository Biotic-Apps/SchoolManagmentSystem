"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUp } from "lucide-react";
import { NAV_COPY } from "@/lib/site/content";

const SHOW_AFTER = 400;
const R = 20;

/**
 * A small ring in the bottom-right corner that fills as the page is read, and
 * takes you back to the top when pressed.
 *
 * It is a plain `#top` link: `SmoothScroll` routes it through Lenis, and with
 * no Lenis (reduced motion, no JS) the browser's own `#top` jump does the
 * same. `z-[55]` keeps it above the header but under the mobile sheet.
 *
 * The `<noscript>` rule lives here because this renders once per page: the
 * entrance blur from `Reveal` must not stay on content that never animates.
 */
export function ScrollProgress() {
  const { scrollY, scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const smoothed = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.25 });
  const pathLength = reduced ? scrollYProgress : smoothed;

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > SHOW_AFTER;
    setVisible((prev) => (prev === next ? prev : next));
  });

  return (
    <>
      <noscript>
        <style>{"[data-motion]{filter:none!important}"}</style>
      </noscript>
      <AnimatePresence>
        {visible ? (
          <motion.a
            key="to-top"
            href="#top"
            aria-label={NAV_COPY.backToTop}
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="group fixed bottom-5 right-5 z-[55] grid size-12 place-items-center rounded-full bg-surface/90 text-brand-700 shadow-[0_10px_30px_-12px_rgb(42_31_107/0.45)] ring-1 ring-line backdrop-blur-md sm:bottom-7 sm:right-7"
          >
            <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90">
              <defs>
                <linearGradient id="scroll-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-400)" />
                  <stop offset="100%" stopColor="var(--color-accent-500)" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r={R} fill="none" stroke="var(--color-line)" strokeWidth="2.5" />
              <motion.circle
                cx="24"
                cy="24"
                r={R}
                fill="none"
                stroke="url(#scroll-ring)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
            <ArrowUp
              className="relative size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
              strokeWidth={2.4}
            />
          </motion.a>
        ) : null}
      </AnimatePresence>
    </>
  );
}
