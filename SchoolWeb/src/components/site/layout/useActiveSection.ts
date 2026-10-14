"use client";

import { useEffect, useState } from "react";

/**
 * The id of whichever of `ids` sits across the middle of the viewport, or
 * null. One IntersectionObserver for all of them, so it costs nothing per frame.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    const nodes = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Document order wins when two sections share the band.
        const first = nodes.find((node) => visible.has(node.id));
        setActive(first ? first.id : null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
