"use client";

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drag maths for the horizontal day rail. It measures how far the track can
 * travel inside its window, keeps the drag inside that, and lets the arrow
 * buttons step one card at a time. Nothing here listens to page scroll.
 */
export function useDayRail(count: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const [maxShift, setMaxShift] = useState(0);
  const [step, setStep] = useState(1);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const [first, second] = Array.from(track.querySelectorAll("li"));
      const shift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setMaxShift(shift);
      if (first && second) setStep(second.offsetLeft - first.offsetLeft);
      if (-x.get() > shift) x.set(-shift);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [x]);

  const lastIndex = Math.max(0, Math.min(count - 1, Math.ceil(maxShift / step)));

  useMotionValueEvent(x, "change", (value) => {
    setIndex(Math.min(lastIndex, Math.max(0, Math.round(-value / step))));
    setEdges({ start: -value < 2, end: -value > maxShift - 2 });
  });

  const progress = useTransform(x, (value) => (maxShift ? Math.min(1, Math.max(0, -value / maxShift)) : 0));

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.min(lastIndex, Math.max(0, target));
      const to = -Math.min(maxShift, clamped * step);
      if (to === x.get()) return;
      if (reduced) x.set(to);
      else animate(x, to, { type: "spring", stiffness: 260, damping: 34 });
    },
    [lastIndex, maxShift, step, reduced, x],
  );

  return {
    viewportRef,
    trackRef,
    x,
    progress,
    maxShift,
    canPrev: !edges.start,
    canNext: maxShift > 0 && !edges.end,
    prev: () => goTo(index - 1),
    next: () => goTo(index + 1),
  };
}
