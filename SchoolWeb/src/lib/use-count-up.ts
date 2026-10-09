"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 650;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Eases from the previous value (0 on first show) to `target`; jumps straight there under reduced motion. */
export function useCountUp(target: number): number {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : 0));
  const from = useRef(shown);

  useEffect(() => {
    if (prefersReducedMotion()) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const value = Math.round(origin + (target - origin) * easeOut(t));
      from.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}
