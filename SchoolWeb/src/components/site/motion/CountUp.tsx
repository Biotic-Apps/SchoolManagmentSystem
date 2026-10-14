"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/site/gsap";

/** `useLayoutEffect` on the client, `useEffect` on the server, without the warning. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Fractional digits — money keeps 2, counts keep 0. */
  decimals?: number;
  durationMs?: number;
  className?: string;
};

const format = (n: number, decimals: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/**
 * Counts from zero to `value` the first time it scrolls into view.
 *
 * The final figure is what renders — so the served HTML and the no-JavaScript
 * view are both correct — and the animation rewrites the node's text directly
 * rather than through state. That avoids a re-render on every frame, and the
 * layout effect resets it to zero before the browser paints, so there is no
 * flash of the final number first.
 *
 * An IntersectionObserver starts it rather than a scroll scrub, so the number
 * always lands exactly on `value` instead of drifting with scroll position.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  durationMs = 1400,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced motion: leave the rendered final value alone.
    if (prefersReducedMotion()) return;

    const write = (n: number) => {
      node.textContent = `${prefix}${format(n, decimals)}${suffix}`;
    };

    write(0);

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          // Ease-out-expo: quick off the mark, settling gently on the figure.
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          write(value * eased);
          if (progress < 1) {
            frame = requestAnimationFrame(step);
          } else {
            write(value);
          }
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, prefix, suffix, decimals, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  );
}
