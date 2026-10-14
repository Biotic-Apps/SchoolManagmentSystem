"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Feature } from "./features";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The four points of a card as compact icon rows, staggered in once the card is up. */
export function FeaturePoints({
  feature,
  shown,
}: {
  feature: Feature;
  shown: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
      {feature.points.map((point, index) => {
        const Icon = feature.icons[index];
        return (
          <motion.li
            key={point.title}
            data-motion
            initial={false}
            animate={
              shown || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
            }
            transition={{
              duration: 0.55,
              delay: shown ? 0.25 + index * 0.09 : 0,
              ease: EASE,
            }}
            className="flex gap-3 rounded-2xl border border-white/70 bg-white/60 p-3 shadow-[0_1px_2px_rgb(42_31_107/0.05)] backdrop-blur-sm"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-[0_8px_18px_-8px_rgb(123_104_238/0.9)]">
              <Icon className="size-4" strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.92rem] font-semibold leading-snug tracking-[-0.01em]">
                {point.title}
              </span>
              <span className="mt-0.5 block text-[0.78rem] leading-[1.45] text-muted">
                {point.body}
              </span>
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}
