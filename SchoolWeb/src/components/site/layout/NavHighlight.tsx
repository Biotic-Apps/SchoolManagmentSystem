"use client";

import { motion } from "framer-motion";

/**
 * The purple pill that slides between nav items. Every item renders one when
 * it is the highlighted item, and the shared `layoutId` makes Framer glide the
 * single pill from the old item to the new one (transform only).
 */
export function NavHighlight() {
  return (
    <motion.span
      aria-hidden
      layoutId="site-nav-highlight"
      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
      className="absolute inset-0 -z-10 rounded-full bg-brand-100/80 ring-1 ring-inset ring-brand-200/70"
    />
  );
}
