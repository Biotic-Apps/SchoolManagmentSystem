"use client";

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const MIN = 0;
const MAX = 100;
const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

/**
 * The state behind the before/after slider. Position lives in a motion value
 * (so dragging never re-renders the scenes); a rounded copy in state feeds
 * `aria-valuenow`. Pointer drags anywhere on the card, arrows, Page keys and
 * Home/End all move it. On first view it gives one small nudge as a hint.
 */
export function useCompareSlider(inView: boolean) {
  const area = useRef<HTMLDivElement>(null);
  const position = useMotionValue(50);
  const [value, setValue] = useState(50);
  const touched = useRef(false);
  const reduced = useReducedMotion();

  useMotionValueEvent(position, "change", (latest) => setValue(Math.round(latest)));

  useEffect(() => {
    if (!inView || reduced || touched.current) return;
    const nudge = animate(position, [50, 38, 62, 50], { duration: 2.2, ease: "easeInOut", delay: 0.4 });
    return () => nudge.stop();
  }, [inView, reduced, position]);

  const moveTo = useCallback(
    (clientX: number) => {
      const box = area.current?.getBoundingClientRect();
      if (!box || box.width === 0) return;
      position.set(clamp(((clientX - box.left) / box.width) * 100));
    },
    [position],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    touched.current = true;
    position.stop();
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event.clientX);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 };
    let next: number | null = null;
    if (event.key in steps) next = position.get() + steps[event.key];
    else if (event.key === "Home") next = MIN;
    else if (event.key === "End") next = MAX;
    if (next === null) return;
    event.preventDefault();
    touched.current = true;
    position.stop();
    position.set(clamp(next));
  };

  return { area, position, value, onPointerDown, onPointerMove, onKeyDown };
}
