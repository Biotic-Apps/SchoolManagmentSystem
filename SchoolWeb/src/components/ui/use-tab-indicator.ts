"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/** Tracks the active tab inside a tab list so a single pill can slide to it. */
export function useTabIndicator<T extends HTMLElement>() {
  const listRef = useRef<T>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (!active) return setStyle(null);
      setStyle({
        width: active.offsetWidth,
        height: active.offsetHeight,
        transform: `translate3d(${active.offsetLeft}px, ${active.offsetTop}px, 0)`,
      });
    };
    measure();
    const mutations = new MutationObserver(measure);
    mutations.observe(list, { subtree: true, attributes: true, attributeFilter: ["data-state"], childList: true });
    const resize = new ResizeObserver(measure);
    resize.observe(list);
    return () => {
      mutations.disconnect();
      resize.disconnect();
    };
  }, []);

  return { listRef, style };
}
