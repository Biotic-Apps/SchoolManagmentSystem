"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Drives the little timeline illustrations: counts 0..count while the card is
 * on screen, holds the finished state for a beat, then starts over.
 *
 * Reduced-motion visitors get the finished state straight away and nothing
 * loops. Off screen the timer stops, so three cards never tick in the
 * background.
 */
export function useLoopStep(count: number, stepMs = 650, holdMs = 2200) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;
    const delay = step >= count ? holdMs : stepMs;
    const id = window.setTimeout(
      () => setStep((s) => (s >= count ? 0 : s + 1)),
      delay,
    );
    return () => window.clearTimeout(id);
  }, [step, inView, reduced, count, stepMs, holdMs]);

  return { ref, step: reduced ? count : step };
}
