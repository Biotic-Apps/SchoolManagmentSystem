"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Thin bar across the top showing how far through the page the reader is.
 *
 * `z-[55]`, deliberately: above the header at `z-50` so the hairline is never
 * buried, but below the mobile sheet at `z-[60]`. At `z-[70]` it painted a
 * purple progress bar across the top of the open navigation menu, which is a
 * page-position readout for a page nobody is looking at.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();

  // A spring is still a running animation. Someone who asked their OS for less
  // motion gets the position reported directly rather than eased into place.
  const smoothed = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.25 });
  const scaleX = reduced ? scrollYProgress : smoothed;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700"
    />
  );
}
