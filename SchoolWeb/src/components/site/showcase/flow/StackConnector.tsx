"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Vertical connector for the stacked layout: the line draws in when it scrolls
 * into view and a dot keeps running down it, from one stage to the next.
 */
export function StackConnector() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="flex justify-center py-1">
      <svg viewBox="0 0 40 76" className="h-16 w-10 overflow-visible">
        <path
          d="M20 4 L20 72"
          stroke="var(--color-brand-200)"
          strokeWidth="2"
          strokeDasharray="2 6"
          strokeLinecap="round"
        />
        <motion.path
          data-motion
          d="M20 4 L20 72"
          stroke="var(--color-brand-500)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: reduced ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        {reduced ? null : (
          <motion.circle
            data-motion
            cx="20"
            cy="4"
            r="5"
            fill="var(--color-brand-600)"
            stroke="white"
            strokeWidth="2"
            animate={{ y: [0, 10, 58, 68], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.15, 0.85, 1],
            }}
          />
        )}
      </svg>
    </div>
  );
}
