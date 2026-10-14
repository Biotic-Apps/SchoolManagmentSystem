"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/site/motion/CountUp";

const RADIUS = 80;
const STROKE = 14;
const SIZE = (RADIUS + STROKE) * 2;

/**
 * A radial ring that draws itself to `value` percent the first time it scrolls
 * into view, with the figure counting up in the middle. Reduced motion starts
 * on the finished ring.
 */
export function AttendanceRing({ value, label }: { value: number; label: string }) {
  const reduced = useReducedMotion();
  const share = value / 100;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[12rem] sm:max-w-[15rem]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="attendance-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7b68ee" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgb(123 104 238 / 0.12)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="url(#attendance-ring)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          initial={{ pathLength: reduced ? share : 0 }}
          whileInView={{ pathLength: share }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[2.8rem] font-semibold leading-none tracking-[-0.04em] tabular-nums text-foreground">
            <CountUp value={value} decimals={0} durationMs={1600} />
            <span className="text-[0.5em] font-medium text-faint">%</span>
          </p>
          <p className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-faint sm:text-[0.7rem] sm:tracking-[0.12em]">{label}</p>
        </div>
      </div>
    </div>
  );
}
