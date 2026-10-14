"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Connector } from "./useConnectors";

type ConnectorLinesProps = {
  w: number;
  h: number;
  lines: Connector[];
  active: number | null;
  drawn: boolean;
};

/**
 * The thin lines joining each trust point to the shield. They draw in one
 * after another once the section is on screen; the hovered point's line turns
 * to the brand gradient and a dash pattern flows along it toward the shield.
 */
export function ConnectorLines({
  w,
  h,
  lines,
  active,
  drawn,
}: ConnectorLinesProps) {
  const reduced = useReducedMotion();
  if (!w || !h) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      <defs>
        {/* User-space units: a near-flat line has a zero-height bounding box,
            which would make a bounding-box gradient paint nothing at all. */}
        <linearGradient
          id="trust-connector"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={w}
          y2="0"
        >
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#7b68ee" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {lines.map((line, i) => {
        const on = active === i;
        return (
          <g key={i}>
            <motion.path
              d={line.d}
              stroke={on ? "url(#trust-connector)" : "#b4a8f2"}
              strokeWidth={on ? 2.5 : 1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={drawn ? { pathLength: 1 } : undefined}
              transition={{
                duration: 0.9,
                delay: 0.5 + i * 0.12,
                ease: "easeInOut",
              }}
            />
            {on && !reduced ? (
              <motion.path
                d={line.d}
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="4 14"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -36 }}
                transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
                opacity={0.9}
              />
            ) : null}
            <motion.circle
              cx={line.end.x}
              cy={line.end.y}
              r={on ? 5 : 3}
              fill={on ? "#ec4899" : "#a78bfa"}
              initial={{ opacity: 0 }}
              animate={drawn ? { opacity: 1 } : undefined}
              transition={{ delay: 1.2 + i * 0.12 }}
            />
          </g>
        );
      })}
    </svg>
  );
}
