"use client";

import { useEffect, useState, type RefObject } from "react";

export type Connector = { d: string; end: { x: number; y: number } };

/** Layout offset of `el` inside `container`, ignoring transforms (so reveal motion cannot skew it). */
function offsetWithin(el: HTMLElement, container: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * Measures a curved line from each card's inner edge to the rim of the shield.
 * Re-measures whenever the container resizes. Cards left of centre connect from
 * their right edge, cards right of centre from their left edge.
 */
export function useConnectors(
  containerRef: RefObject<HTMLDivElement | null>,
  shieldRef: RefObject<HTMLDivElement | null>,
  cardRefs: RefObject<(HTMLDivElement | null)[]>,
) {
  const [state, setState] = useState<{
    w: number;
    h: number;
    lines: Connector[];
  }>({
    w: 0,
    h: 0,
    lines: [],
  });

  useEffect(() => {
    const container = containerRef.current;
    const shield = shieldRef.current;
    if (!container || !shield) return;

    const measure = () => {
      const s = offsetWithin(shield, container);
      const cx = s.x + shield.offsetWidth / 2;
      const cy = s.y + shield.offsetHeight / 2;
      const radius = shield.offsetWidth * 0.56;

      const lines = (cardRefs.current ?? []).flatMap((card) => {
        if (!card) return [];
        const o = offsetWithin(card, container);
        const leftOfCentre = o.x + card.offsetWidth / 2 < cx;
        const ax = leftOfCentre ? o.x + card.offsetWidth : o.x;
        const ay = o.y + card.offsetHeight / 2;
        const angle = Math.atan2(ay - cy, ax - cx);
        const ex = cx + Math.cos(angle) * radius;
        const ey = cy + Math.sin(angle) * radius;
        const mx = (ax + ex) / 2;
        return [
          {
            d: `M${ax} ${ay} C${mx} ${ay}, ${mx} ${ey}, ${ex} ${ey}`,
            end: { x: ex, y: ey },
          },
        ];
      });

      setState({ w: container.offsetWidth, h: container.offsetHeight, lines });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, shieldRef, cardRefs]);

  return state;
}
