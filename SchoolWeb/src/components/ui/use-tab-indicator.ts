"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

interface IndicatorOptions {
  /** Finds the selected item inside the list. */
  selector?: string;
  /** Attributes whose change means the selection moved. */
  attributes?: string[];
}

const TAB_OPTIONS = { selector: '[role="tab"][data-state="active"]', attributes: ["data-state"] };

/**
 * Tracks the selected item inside a list so a single pill can slide to it.
 * Position is a transform; `animated` stays false for the first paint so the pill appears in place
 * and only later moves slide. Re-measures when the list or any item resizes (fonts, viewport).
 * Reduced motion is handled by the global transition override in motion.css.
 */
export function useTabIndicator<T extends HTMLElement>({
  selector = TAB_OPTIONS.selector,
  attributes = TAB_OPTIONS.attributes,
}: IndicatorOptions = {}) {
  const listRef = useRef<T>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const [animated, setAnimated] = useState(false);
  const attributeKey = attributes.join(",");

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const resize = new ResizeObserver(() => measure());
    const measure = () => {
      const active = list.querySelector<HTMLElement>(selector);
      if (!active) return setStyle(null);
      setStyle({
        width: active.offsetWidth,
        height: active.offsetHeight,
        transform: `translate3d(${active.offsetLeft}px, ${active.offsetTop}px, 0)`,
      });
    };
    const observeItems = () => {
      resize.disconnect();
      resize.observe(list);
      for (const child of Array.from(list.children)) resize.observe(child);
    };
    measure();
    observeItems();
    const mutations = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) observeItems();
      measure();
    });
    mutations.observe(list, { subtree: true, attributes: true, attributeFilter: attributeKey.split(","), childList: true });
    // Turn the slide on only after the first placement has painted.
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      resize.disconnect();
    };
  }, [selector, attributeKey]);

  return { listRef, style, animated };
}
