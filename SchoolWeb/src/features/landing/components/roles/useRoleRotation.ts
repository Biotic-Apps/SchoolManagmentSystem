"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia(REDUCED_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Active index that auto-advances every `intervalMs` until the user picks one.
 * Pauses while hovered/focused; never auto-advances under reduced motion.
 */
export function useRoleRotation(count: number, intervalMs = 5000) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => true,
  );

  const autoplay = !stopped && !reduced;
  const running = autoplay && !paused;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearTimeout(timer);
  }, [running, index, count, intervalMs]);

  const select = useCallback((next: number) => {
    setStopped(true);
    setIndex(next);
  }, []);

  return { index, select, setPaused, autoplay, running, intervalMs };
}
