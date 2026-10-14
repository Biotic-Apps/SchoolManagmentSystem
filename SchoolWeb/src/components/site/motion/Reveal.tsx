"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait before this element animates — used to stagger a row. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "header";
};

/**
 * The single fade-up used across the whole site.
 *
 * Framer Motion drops the transform entirely when the OS asks for reduced
 * motion, so no separate fallback branch is needed here.
 */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      data-motion
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.62, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}
