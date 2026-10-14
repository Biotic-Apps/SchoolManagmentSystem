"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Content comes into focus rather than simply fading up: it starts a little
 * soft, a little small and a little low, and sharpens into place. The blur is
 * what makes it read as "arriving" instead of "appearing".
 *
 * Blur is opt-in (`soft`) and meant for SMALL elements only, a heading line,
 * a card: filtering a whole section every frame is what makes scrolling stall.
 * It is also short (0.45s) and gone by the end. Without JavaScript the `<noscript>`
 * rules (layout + `ScrollProgress`) clear opacity, transform and filter.
 */
const plain: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  shown: { opacity: 1, y: 0, scale: 1 },
};

const soft_: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98, filter: "blur(8px)" },
  shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
};

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait before this element animates, used to stagger a row. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "header";
  /** Adds the brief blur-in. Only for small elements, never a whole block. */
  soft?: boolean;
};

export function Reveal({ children, delay = 0, className, as = "div", soft = false }: RevealProps) {
  const Component = motion[as];
  const reduced = useReducedMotion();

  return (
    <Component
      data-motion
      className={className}
      variants={soft ? soft_ : plain}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={
        reduced
          ? { duration: 0.01 }
          : {
              duration: 0.75,
              delay,
              ease: [0.22, 1, 0.36, 1],
              filter: { duration: 0.45, delay, ease: "easeOut" },
            }
      }
    >
      {children}
    </Component>
  );
}

/* ------------------------------------------------------------------ */
/* Word mask reveal                                                    */
/* ------------------------------------------------------------------ */

const line: Variants = {
  hidden: {},
  shown: (delay: number) => ({
    transition: { staggerChildren: 0.07, delayChildren: delay },
  }),
};

const word: Variants = {
  hidden: { y: "115%" },
  shown: { y: "0%", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

type RevealWordsProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  /** How many trailing words wear the gradient ink. 0 for none. */
  highlight?: number;
  /** Classes for the highlighted words, so dark bands can pick a lighter ink. */
  highlightClassName?: string;
};

/**
 * A heading whose words slide up, one after another, from behind their own
 * baseline clip. Flat, not tilted: just a clean mask lift.
 *
 * The viewport trigger sits on the heading: a word fully below its clip
 * reports zero intersection, so `whileInView` on the word would never fire.
 * Real spaces sit between the spans so the heading copies and reads as text.
 */
export function RevealWords({
  text,
  as = "h2",
  className,
  delay = 0,
  highlight = 0,
  highlightClassName = "bg-gradient-to-r from-brand-500 via-brand-600 to-accent-500 bg-clip-text text-transparent",
}: RevealWordsProps) {
  const Tag = motion[as];
  const words = text.split(" ");
  const firstHighlighted = words.length - highlight;

  return (
    <Tag
      className={className}
      variants={line}
      custom={delay}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {words.map((item, index) => (
        <span key={`${item}-${index}`}>
          {/* The padding gives descenders room inside the clip; the negative
              margin keeps the line box the size it would have been. */}
          <span className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom">
            <motion.span
              data-motion
              variants={word}
              className={
                index >= firstHighlighted ? `inline-block ${highlightClassName}` : "inline-block"
              }
            >
              {item}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
