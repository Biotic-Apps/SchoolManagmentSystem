"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/site/cn";

type SparklineProps = {
  points: readonly number[];
  /** Size and text colour — the line and its fill follow `currentColor`. Defaults to h-8 w-24. */
  className?: string;
  delay?: number;
};

const W = 96;
const H = 32;
const PAD = 3;

/**
 * A seven-day trend drawn under a stat tile's figure.
 *
 * The line draws itself in the first time the tile scrolls into view, then a
 * soft fill fades in beneath it. Scaled to its own min and max, so the shape
 * shows the direction of travel rather than a comparison between tiles.
 */
export function Sparkline({ points, className, delay = 0 }: SparklineProps) {
  const gradientId = useId();
  // pathLength is drawn with a dash offset, which the reduced-motion CSS rule
  // cannot reset — so skip the entrance entirely rather than leave no line.
  const still = useReducedMotion() ?? false;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((value, index) => {
    const x = PAD + (index / Math.max(points.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - ((value - min) / span) * (H - PAD * 2);
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });

  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0]} ${H} L${coords[0][0]} ${H} Z`;
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      className={cn("overflow-visible", className ?? "h-8 w-24")}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        data-motion
        d={area}
        fill={`url(#${gradientId})`}
        initial={still ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay + 0.7 }}
      />
      <motion.path
        data-motion
        d={line}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={still ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      />
      <motion.circle
        data-motion
        cx={lastX}
        cy={lastY}
        r={2.6}
        fill="currentColor"
        initial={still ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 320, damping: 16, delay: delay + 1 }}
      />
    </svg>
  );
}
