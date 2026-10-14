"use client";

import { motion, useInView, useTransform } from "framer-motion";
import { ChevronsLeftRight } from "lucide-react";
import { useRef } from "react";
import { COMPARE_COPY as COPY } from "@/lib/site/content";
import { ESchoolSide } from "./ESchoolSide";
import { PaperSide } from "./PaperSide";
import { useCompareSlider } from "./useCompareSlider";

/**
 * One card, two scenes. Paper sits underneath; eSchool lies on top inside a
 * window that starts at the handle. The window is moved by a transform and
 * its contents by the opposite transform, so the scene itself never moves
 * and nothing is laid out again while dragging.
 */
export function CompareSlider() {
  const card = useRef<HTMLDivElement>(null);
  const inView = useInView(card, { once: true, margin: "0px 0px -20% 0px" });
  const { area, position, value, onPointerDown, onPointerMove, onKeyDown } = useCompareSlider(inView);
  const windowX = useTransform(position, (p) => `${p}%`);
  const sceneX = useTransform(position, (p) => `${-p}%`);
  const handleLeft = useTransform(position, (p) => `${p}%`);

  return (
    <div ref={card} className="relative overflow-hidden rounded-[1.4rem] ring-1 ring-line shadow-lift">
      <div
        ref={area}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative cursor-ew-resize touch-pan-y select-none"
      >
        <div aria-hidden={value >= 100}>
          <PaperSide />
        </div>
        <motion.div className="absolute inset-0 overflow-hidden" style={{ x: windowX }} aria-hidden={value <= 0}>
          <motion.div className="size-full" style={{ x: sceneX }}>
            <ESchoolSide />
          </motion.div>
        </motion.div>

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#3b3427] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-[#f6efdc]">
          {COPY.paperLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-white">
          {COPY.eschoolLabel}
        </span>

        <motion.div className="pointer-events-none absolute inset-y-0 w-0" style={{ left: handleLeft }}>
          <span className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_0_1px_rgb(42_31_107/0.15)]" />
          <span
            role="slider"
            tabIndex={0}
            aria-label={COPY.sliderLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={`${value}${COPY.sliderValue}`}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="pointer-events-auto absolute left-0 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-600 shadow-lift ring-1 ring-line outline-none focus-visible:shadow-glow focus-visible:ring-brand-500"
          >
            <ChevronsLeftRight className="size-5" strokeWidth={2.4} />
          </span>
        </motion.div>
      </div>
    </div>
  );
}
