"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * A small looping counter for the card illustrations. It only ticks while
 * the card is on screen, and with reduced motion it rests on the final frame.
 */
export function useMiniLoop(frames: number, interval = 1400) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % frames), interval);
    return () => window.clearInterval(id);
  }, [inView, reduced, frames, interval]);

  return { ref, frame: reduced ? frames - 1 : tick, still: Boolean(reduced) };
}
