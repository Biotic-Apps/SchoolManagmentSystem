"use client";

import { motion, type Variants } from "framer-motion";
import { BRAND } from "@/lib/brand";

const letters = Array.from(BRAND);

const word: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
};

const letter: Variants = {
  hidden: { y: "105%", rotate: 6, opacity: 0 },
  shown: {
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * The oversized brand name the footer ends on. Each letter rises out of a mask
 * as the footer scrolls in. The gradient is painted per letter, offset along a
 * shared strip, so the seven letters read as one continuous sweep.
 */
export function FooterWordmark() {
  return (
    <motion.p
      aria-hidden
      variants={word}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.4 }}
      className="flex select-none justify-center overflow-hidden pb-[0.06em] text-[clamp(5.25rem,23vw,19rem)] font-bold leading-[0.95] tracking-[-0.06em]"
    >
      {letters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={letter}
          className="inline-block origin-bottom-left bg-clip-text pr-[0.02em] text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(100deg, var(--color-brand-300), var(--color-brand-500) 40%, var(--color-brand-700) 70%, var(--color-accent-400))",
            backgroundSize: `${letters.length * 100}% 100%`,
            backgroundPosition: `${(index / (letters.length - 1)) * 100}% 0`,
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
}
