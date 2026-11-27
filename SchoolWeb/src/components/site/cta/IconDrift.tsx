"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Backpack,
  Bell,
  BookOpen,
  Bus,
  Calculator,
  CalendarCheck,
  GraduationCap,
  NotebookPen,
  PencilRuler,
  Receipt,
  School,
  Trophy,
  type LucideIcon,
} from "lucide-react";

const ICONS: LucideIcon[] = [
  GraduationCap, BookOpen, Backpack, Calculator, Bus, Bell,
  PencilRuler, Trophy, School, NotebookPen, Receipt, CalendarCheck,
];

const ROWS = 5;
/** One IconDrift per page (the closing band), so a fixed id prefix is unique. */
const SYMBOL_ID = "cta-drift-icon-";

/**
 * A faint, tilted wall of school icons drifting behind the closing band, each
 * row sliding the opposite way to its neighbour. Every row holds the icon set
 * four times, so moving it by exactly half its width loops without a seam.
 *
 * Each icon is drawn once as an SVG <symbol> and the 240 copies are <use>
 * references, which keeps ~120 KB of repeated path markup out of the HTML.
 */
export function IconDrift() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]"
    >
      <svg width="0" height="0" className="absolute" focusable="false">
        <defs>
          {ICONS.map((Icon, index) => (
            <symbol key={index} id={`${SYMBOL_ID}${index}`} viewBox="0 0 24 24">
              <Icon strokeWidth={1.5} />
            </symbol>
          ))}
        </defs>
      </svg>
      <div className="absolute left-1/2 top-1/2 flex w-[180%] -translate-x-1/2 -translate-y-1/2 -rotate-12 flex-col gap-10">
        {Array.from({ length: ROWS }, (_, row) => {
          const order = ICONS.map((_, index) => index);
          const set = [...order.slice(row * 2), ...order.slice(0, row * 2)];
          const forward = row % 2 === 0;
          return (
            <motion.div
              key={row}
              className="flex w-max text-white/[0.09]"
              initial={{ transform: forward ? "translateX(0%)" : "translateX(-50%)" }}
              animate={reduced ? undefined : { transform: forward ? "translateX(-50%)" : "translateX(0%)" }}
              transition={{ duration: 60 + row * 8, ease: "linear", repeat: Infinity }}
            >
              {[...set, ...set, ...set, ...set].map((icon, index) => (
                <svg key={index} className="mr-14 size-9 shrink-0" viewBox="0 0 24 24" focusable="false">
                  <use href={`#${SYMBOL_ID}${icon}`} />
                </svg>
              ))}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
