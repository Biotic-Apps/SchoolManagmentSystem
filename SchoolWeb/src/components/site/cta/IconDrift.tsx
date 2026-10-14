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

/**
 * A faint, tilted wall of school icons drifting behind the closing band, each
 * row sliding the opposite way to its neighbour. Every row holds the icon set
 * four times, so moving it by exactly half its width loops without a seam.
 */
export function IconDrift() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]"
    >
      <div className="absolute left-1/2 top-1/2 flex w-[180%] -translate-x-1/2 -translate-y-1/2 -rotate-12 flex-col gap-10">
        {Array.from({ length: ROWS }, (_, row) => {
          const set = [...ICONS.slice(row * 2), ...ICONS.slice(0, row * 2)];
          const forward = row % 2 === 0;
          return (
            <motion.div
              key={row}
              className="flex w-max text-white/[0.09]"
              initial={{ transform: forward ? "translateX(0%)" : "translateX(-50%)" }}
              animate={reduced ? undefined : { transform: forward ? "translateX(-50%)" : "translateX(0%)" }}
              transition={{ duration: 60 + row * 8, ease: "linear", repeat: Infinity }}
            >
              {[...set, ...set, ...set, ...set].map((Icon, index) => (
                <Icon key={index} className="mr-14 size-9 shrink-0" strokeWidth={1.5} />
              ))}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
