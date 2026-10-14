"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Steps through `count` items every `interval` ms while `running` is true.
 * Hovering pauses it (and the countdown starts again when the pointer leaves);
 * any manual pick stops it for good, because the reader has taken over.
 */
export function useAutoAdvance(count: number, interval: number, running: boolean) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const ticking = running && !paused && !stopped;

  useEffect(() => {
    if (!ticking) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % count), interval);
    return () => window.clearTimeout(id);
  }, [ticking, active, count, interval]);

  const pick = useCallback((index: number) => {
    setStopped(true);
    setActive(index);
  }, []);

  return { active, pick, ticking, setPaused };
}
