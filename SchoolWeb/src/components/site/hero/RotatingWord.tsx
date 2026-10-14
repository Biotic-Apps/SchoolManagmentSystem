"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type RotatingWordProps = {
  words: readonly string[];
  /** Milliseconds each word holds before the next one arrives. */
  interval?: number;
  /** Seconds before the first word rises in with the rest of the headline. */
  delay?: number;
};

/**
 * One line of the headline that cycles through what the school runs on.
 *
 * Every word sits in the same absolutely positioned slot, so the line never
 * changes height and nothing below it jumps. The outgoing word lifts and blurs
 * away while the next rises out of the blur underneath. Under reduced motion
 * the first word is shown and the cycle never starts.
 */
export function RotatingWord({ words, interval = 2400, delay = 0 }: RotatingWordProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    let timer = 0;
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    }, delay * 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [reduced, words.length, interval, delay]);

  return (
    <span className="relative block h-[1.18em]">
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          className="absolute left-0 top-0 whitespace-nowrap bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text pb-[0.12em] text-transparent"
          initial={{ y: "70%", opacity: 0, filter: "blur(10px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-70%", opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
