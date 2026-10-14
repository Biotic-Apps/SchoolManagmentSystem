"use client";

import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";
import { refreshScrollTriggers } from "@/lib/site/scroll";
import { ROW_QUERY } from "./flowStyle";

type FlowRefs = {
  /** The row of stages; its own pass through the viewport is the timeline. */
  row: RefObject<HTMLDivElement | null>;
  paths: RefObject<Array<SVGPathElement | null>>;
  dots: RefObject<Array<SVGGElement | null>>;
  setStep: Dispatch<SetStateAction<number>>;
};

/** Where each connector draws, as a share of the row's pass. */
const SEGMENTS = [
  [0.12, 0.42],
  [0.52, 0.82],
] as const;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The row layout's timeline. Nothing is pinned and no scroll distance is added:
 * the page scrolls at its normal speed, and while the row passes through the
 * viewport the lines draw from one stage to the next, a dot riding each line's
 * leading edge. A stage lights up the moment its line reaches it, and scrolling
 * back runs it all in reverse.
 */
export function useFlowScroll({ row, paths, dots, setStep }: FlowRefs) {
  useEffect(() => {
    const track = row.current;
    if (!track) return;
    const media = gsap.matchMedia();

    media.add(ROW_QUERY, () => {
      const lengths = paths.current.map((path) => path?.getTotalLength() ?? 0);

      const paint = (progress: number) => {
        let step = progress > 0 ? 1 : 0;
        SEGMENTS.forEach(([from, to], i) => {
          const local = clamp((progress - from) / (to - from));
          if (local >= 1) step = i + 2;
          const path = paths.current[i];
          const dot = dots.current[i];
          if (!path || !dot) return;
          path.style.strokeDashoffset = String(1 - local);
          const point = path.getPointAtLength(lengths[i] * local);
          dot.setAttribute("transform", `translate(${point.x} ${point.y})`);
          dot.setAttribute("opacity", local > 0 ? "1" : "0");
        });
        setStep(step);
      };

      if (prefersReducedMotion()) {
        paint(1);
        return;
      }

      const playhead = { progress: 0 };
      gsap.to(playhead, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: track,
          start: "top 78%",
          end: "bottom 45%",
          scrub: 0.5,
        },
        onUpdate: () => paint(playhead.progress),
      });
    });

    refreshScrollTriggers();
    return () => media.revert();
  }, [row, paths, dots, setStep]);
}
