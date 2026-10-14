"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/** Past this, the pill settles into its compact state. */
const COMPACT_AT = 80;
/** The pill never hides this close to the top of the page. */
const HIDE_AFTER = 240;
/** Downward travel, in px since the last turn, that hides the pill. */
const HIDE_DISTANCE = 160;
/** Or a flick this fast (px/s) hides it straight away. */
const HIDE_VELOCITY = 1400;
/** Upward travel that brings it back. */
const SHOW_DISTANCE = 12;

/**
 * Scroll state for the floating nav: `compact` once the page is under way,
 * `hidden` while reading downwards, back on the first nudge upwards.
 *
 * React state changes only when one of the two booleans flips, so a scroll
 * event costs a comparison, not a render.
 */
export function useNavScroll(enabled: boolean) {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const travel = useRef(0);
  const last = useRef(0);
  const state = useRef({ compact: false, hidden: false });

  // Only touch React when a flag actually flips.
  const setFlag = (key: "compact" | "hidden", value: boolean) => {
    if (state.current[key] === value) return;
    state.current[key] = value;
    if (key === "compact") setCompact(value);
    else setHidden(value);
  };

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - last.current;
    last.current = y;

    setFlag("compact", y > COMPACT_AT);

    if (!enabled || y < HIDE_AFTER) {
      travel.current = 0;
      setFlag("hidden", false);
      return;
    }

    // Reset the running total whenever the direction turns.
    if (Math.sign(delta) !== Math.sign(travel.current)) travel.current = 0;
    travel.current += delta;

    if (travel.current > HIDE_DISTANCE || scrollY.getVelocity() > HIDE_VELOCITY) {
      setFlag("hidden", true);
    } else if (travel.current < -SHOW_DISTANCE) {
      setFlag("hidden", false);
    }
  });

  return { compact, hidden };
}
