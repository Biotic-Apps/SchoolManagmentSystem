"use client";

import { motion, useInView } from "framer-motion";
import { useId, useRef } from "react";
import { cn } from "@/lib/site/cn";

const SHIELD =
  "M100 10 L180 40 V108 C180 160 148 196 100 220 C52 196 20 160 20 108 V40 Z";
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The shield at the centre of the trust section. When it scrolls into view its
 * outline draws itself, then the open padlock's shackle drops shut with a small
 * bounce and a pulse rings outward. Everything animated is a transform, an
 * opacity or an SVG path length.
 */
export function ShieldLock({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const state = shown ? "on" : "off";
  // Rendered twice on the page (desktop orbit and phone stack), so gradient ids must be unique.
  const uid = useId().replace(/:/g, "");
  const fillId = `shield-fill-${uid}`;
  const edgeId = `shield-edge-${uid}`;

  return (
    <div ref={ref} aria-hidden className={cn("relative", className)}>
      {/* The pulse that fires once the lock closes. */}
      <motion.span
        data-motion
        className="absolute inset-[12%] rounded-full bg-brand-400/40"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={
          shown ? { scale: [0.6, 1.5], opacity: [0, 0.6, 0] } : undefined
        }
        transition={{ delay: 1.35, duration: 1.2, ease: "easeOut" }}
      />
      <svg
        viewBox="0 0 200 230"
        className="relative h-auto w-full drop-shadow-[0_30px_40px_rgb(42_31_107/0.35)]"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8f7cf3" />
            <stop offset="55%" stopColor="#5b4bc7" />
            <stop offset="100%" stopColor="#2a1f6b" />
          </linearGradient>
          <linearGradient id={edgeId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>

        <motion.path
          d={SHIELD}
          fill={`url(#${fillId})`}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={state === "on" ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ transformOrigin: "100px 115px" }}
        />
        {/* Inner sheen */}
        <path
          d="M100 26 L164 50 V104 C164 128 156 146 142 160 L100 26 Z"
          fill="#fff"
          opacity="0.08"
        />
        <motion.path
          d={SHIELD}
          fill="none"
          stroke={`url(#${edgeId})`}
          strokeWidth="4"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={state === "on" ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.1, ease: "easeInOut", delay: 0.1 }}
        />

        {/* Shackle: starts lifted, drops shut. */}
        <motion.path
          d="M80 112 V92 a20 20 0 0 1 40 0 V112"
          fill="none"
          stroke="#fff"
          strokeWidth="9"
          strokeLinecap="round"
          initial={{ y: -18 }}
          animate={state === "on" ? { y: 0 } : undefined}
          transition={{ delay: 1, type: "spring", stiffness: 520, damping: 14 }}
        />
        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={state === "on" ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
        >
          <rect x="66" y="108" width="68" height="56" rx="12" fill="#fff" />
          <circle cx="100" cy="130" r="7" fill="#5b4bc7" />
          <rect x="97" y="132" width="6" height="16" rx="3" fill="#5b4bc7" />
        </motion.g>
      </svg>
    </div>
  );
}
