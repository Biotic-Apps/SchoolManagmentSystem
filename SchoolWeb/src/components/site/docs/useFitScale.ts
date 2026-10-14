"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures a container and returns how far a fixed-size drawing of `base`
 * pixels must shrink to fit its width (never grows past 1). The documents are
 * drawn at one real size and scaled as a whole, so their tiny print keeps its
 * proportions on every screen.
 */
export function useFitScale<T extends HTMLElement>(base: number, gutter = 0) {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, Math.max(0.1, (el.clientWidth - gutter) / base)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [base, gutter]);

  return [ref, scale] as const;
}
