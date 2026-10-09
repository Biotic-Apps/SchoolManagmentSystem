"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatNumber } from "@/lib/format";

const PLAIN_COUNT = /^\d{1,3}(,\d{3})*$|^\d+$/;
const TWEEN_MS = 400;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Shows `target` straight away on first paint (no count-up from zero, so a remount after a refetch is still),
 * and only eases between values when the number really changes. Reduced motion: jumps.
 */
function useTweenedNumber(target: number): number {
  const [shown, setShown] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const origin = current.current;
    if (origin === target) return;
    const instant = prefersReducedMotion();
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = instant ? 1 : Math.min(1, (now - start) / TWEEN_MS);
      const value = Math.round(origin + (target - origin) * easeOut(t));
      current.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}

function Tweened({ target }: { target: number }) {
  const shown = useTweenedNumber(target);
  return (
    <span className="tabular-nums">
      <span aria-hidden>{formatNumber(shown)}</span>
      <span className="sr-only">{formatNumber(target)}</span>
    </span>
  );
}

/** Plain whole numbers (or "1,234" strings) ease between values when they change; anything else renders as given. */
export function AnimatedNumber({ value }: { value: ReactNode }) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return <Tweened target={value} />;
  if (typeof value === "string" && PLAIN_COUNT.test(value)) return <Tweened target={Number(value.replace(/,/g, ""))} />;
  return <>{value}</>;
}
