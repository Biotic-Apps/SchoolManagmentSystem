"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Makes Framer Motion follow the visitor's operating system like everything
 * else on the page does.
 *
 * Without this, the three animation systems disagree. CSS keyframes and GSAP
 * both stand down when the OS asks for reduced motion, but Framer Motion keeps
 * animating — so on a machine with animations turned off the page played its
 * entrances once and then sat perfectly still, which looks broken rather than
 * calm. `reducedMotion="user"` puts Framer on the same footing: it jumps
 * straight to the final state instead.
 *
 * The result is two coherent experiences rather than one and a half — full
 * motion for most people, a complete and still page for anyone who asked their
 * machine for one. That holds on Windows, macOS, iOS and Android alike, since
 * all four expose the same preference.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
