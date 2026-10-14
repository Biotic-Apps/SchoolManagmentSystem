"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhoneFrame } from "@/components/site/hero/PhoneFrame";
import type { ScreenVariant } from "@/components/site/mock/ScreenMock";

/**
 * A phone held at an angle that bobs up and down on its own slow loop.
 * The tilt sits on the outer element and the float on the inner, so the two
 * never fight over the same transform.
 */
export function FloatingPhone({
  variant,
  tilt,
  duration = 6,
  delay = 0,
  className,
}: {
  variant: ScreenVariant;
  tilt: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={className}>
      <div style={{ transform: `rotate(${tilt}deg)` }}>
        <motion.div
          data-motion
          animate={reduced ? undefined : { y: [0, -12, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <PhoneFrame variant={variant} className="w-full" />
        </motion.div>
      </div>
    </div>
  );
}
