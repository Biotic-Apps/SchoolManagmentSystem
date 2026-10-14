"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/site/cn";

export type TileTone = "purple" | "indigo" | "rose" | "blue" | "sky" | "violet";

// Written out in full because Tailwind only keeps classes it can see. These are
// the six fills the dashboard itself uses on its stat cards, each with a glow
// of its own colour so the tile sits on the card rather than being pasted on.
// `purple` is the brand fill itself (#7B68EE).
const TONES: Record<TileTone, string> = {
  purple: "bg-brand-500 shadow-[0_8px_16px_-8px_rgb(123_104_238/0.55)]",
  indigo: "bg-tile-indigo shadow-[0_8px_16px_-8px_rgb(99_102_241/0.55)]",
  rose: "bg-tile-rose shadow-[0_8px_16px_-8px_rgb(244_63_94/0.55)]",
  blue: "bg-tile-blue shadow-[0_8px_16px_-8px_rgb(59_130_246/0.55)]",
  sky: "bg-tile-sky shadow-[0_8px_16px_-8px_rgb(14_165_233/0.55)]",
  violet: "bg-tile-violet shadow-[0_8px_16px_-8px_rgb(139_92_246/0.55)]",
};

type IconTileProps = {
  /**
   * The icon, already rendered.
   *
   * It has to arrive as an element, not as a component. A Server Component
   * cannot hand a function across the boundary to a Client Component, and a
   * lucide icon is a function — passing `icon={Users}` type-checks
   * perfectly and then fails at build time. An element is serialisable.
   */
  children: ReactNode;
  tone: TileTone;
  /** Stagger position within a row. */
  delay?: number;
  className?: string;
};

/**
 * The filled, rounded icon tile from the product's own dashboard cards.
 *
 * It bounces up into place on a spring rather than fading: a tile that pops in
 * carries a little of the feeling of a figure landing, which is what these
 * cards are for. The spring is short and slightly overshot — long enough to
 * notice, over before it is annoying.
 */
export function IconTile({ children, tone, delay = 0, className }: IconTileProps) {
  return (
    <motion.span
      data-motion
      initial={{ scale: 0.6, opacity: 0, y: 14 }}
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ type: "spring", stiffness: 320, damping: 15, delay }}
      whileHover={{ scale: 1.1, y: -3, rotate: 8 }}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full text-white",
        TONES[tone],
        className,
      )}
    >
      {children}
    </motion.span>
  );
}
