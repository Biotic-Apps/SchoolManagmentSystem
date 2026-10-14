"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/site/cn";
import { DeviceFrame } from "@/components/site/motion/DeviceFrame";
import type { Feature } from "./features";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The product screen on a card. It slides in from the right when the card comes
 * up, then drifts gently so the card never looks like a still picture.
 */
export function FeatureScreen({
  feature,
  shown,
}: {
  feature: Feature;
  shown: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      data-motion
      initial={false}
      animate={shown || reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 90 }}
      transition={{ duration: 0.9, delay: shown ? 0.1 : 0, ease: EASE }}
      className="relative"
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] blur-[60px]",
          feature.glow,
        )}
      />
      <motion.div
        data-motion
        animate={reduced ? undefined : { y: [0, -10, 0], rotate: [0, 0.35, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="will-change-transform"
      >
        <DeviceFrame screen={feature.screen} glare />
      </motion.div>
    </motion.div>
  );
}
