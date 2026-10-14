"use client";

import { useCallback, useRef, type PointerEvent } from "react";

/**
 * One pointer listener for a whole grid of cards.
 *
 * Every `[data-spot]` child gets the pointer position in its own coordinates
 * as `--spot-x` / `--spot-y`. Doing it from the grid rather than per card is
 * what lets the glowing border bleed onto the neighbouring cards as the cursor
 * nears them. Writes are batched to one per frame and touch only custom
 * properties, so React never re-renders on mouse move.
 */
export function useSpotlight<T extends HTMLElement>() {
  const frame = useRef<number | undefined>(undefined);

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    if (event.pointerType === "touch") return;
    const grid = event.currentTarget;
    const { clientX, clientY } = event;
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      grid.querySelectorAll<HTMLElement>("[data-spot]").forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${clientX - rect.left}px`);
        card.style.setProperty("--spot-y", `${clientY - rect.top}px`);
      });
    });
  }, []);

  return { onPointerMove };
}
