"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, Moon, Sun } from "lucide-react";
import type { KeyboardEvent } from "react";
import { SCHOOL_DAY, SCHOOL_DAY_COPY } from "@/lib/site/content";
import { DayCard } from "./DayCard";
import { dayGradient, stopFor } from "./dayColors";
import { useDayRail } from "./useDayRail";

const track: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08 } },
};
const card: Variants = {
  hidden: { opacity: 0, y: 48 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const buttonClass =
  "grid size-11 place-items-center rounded-full border border-line-strong bg-white text-foreground shadow-soft transition hover:border-brand-400 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:pointer-events-none disabled:opacity-40";

function edgeMask(fadeStart: boolean, fadeEnd: boolean) {
  const start = fadeStart ? "transparent 0, #000 72px" : "#000 0";
  const end = fadeEnd ? "#000 calc(100% - 140px), transparent 100%" : "#000 100%";
  return `linear-gradient(to right, ${start}, ${end})`;
}

/** Desktop: the day as a row of cards you drag, swipe or step through. */
export function DayRail() {
  const {
    viewportRef,
    trackRef,
    x,
    progress,
    maxShift,
    canPrev,
    canNext,
    prev,
    next,
  } = useDayRail(SCHOOL_DAY.length);
  const last = SCHOOL_DAY.length - 1;

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") next();
    else if (event.key === "ArrowLeft") prev();
    else return;
    event.preventDefault();
  };

  return (
    <div className="hidden lg:block">
      <div className="mb-6 flex items-center justify-end gap-3">
        <span className="mr-2 text-[0.85rem] text-faint">
          {SCHOOL_DAY_COPY.dragHint}
        </span>
        <button
          type="button"
          className={buttonClass}
          onClick={prev}
          disabled={!canPrev}
          aria-label={SCHOOL_DAY_COPY.prev}
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={next}
          disabled={!canNext}
          aria-label={SCHOOL_DAY_COPY.next}
        >
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>

      <div
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={onKey}
        role="region"
        aria-label={SCHOOL_DAY_COPY.eyebrow}
        className="-mx-3 overflow-hidden rounded-panel px-3 pb-8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        // Fade the edge where more cards wait, so a half-visible card reads as "more this way"
        // instead of being sliced off.
        style={{ maskImage: edgeMask(canPrev, canNext), WebkitMaskImage: edgeMask(canPrev, canNext) }}
      >
        <motion.div
          ref={trackRef}
          drag={maxShift > 0 ? "x" : false}
          dragConstraints={{ left: -maxShift, right: 0 }}
          dragElastic={0.08}
          style={{ x: x }}
          variants={track}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          className="relative w-max cursor-grab select-none pt-10 active:cursor-grabbing"
        >
          {/* The sky of the day, gold at the gate to deep purple at night. */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-[18px] h-1.5 rounded-full"
            style={{ backgroundImage: dayGradient() }}
          />
          <ol className="flex gap-5">
            {SCHOOL_DAY.map((moment, i) => {
              const color = stopFor(i);
              const Marker = i === 0 ? Sun : i === last ? Moon : null;
              return (
                <motion.li
                  key={moment.time}
                  variants={card}
                  className="relative w-[300px] xl:w-[318px]"
                >
                  <span
                    aria-hidden
                    className="absolute -top-[31px] left-6 grid size-6 place-items-center rounded-full border-[3px] border-white text-white shadow-soft"
                    style={{ backgroundColor: color }}
                  >
                    {Marker ? <Marker className="size-3" /> : null}
                  </span>
                  <DayCard moment={moment} color={color} />
                </motion.li>
              );
            })}
          </ol>
        </motion.div>
      </div>

      <div
        role="progressbar"
        aria-label={SCHOOL_DAY_COPY.progressLabel}
        className="mx-auto mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-line"
      >
        <motion.div
          className="h-full origin-left rounded-full"
          style={{ scaleX: progress, backgroundImage: dayGradient() }}
        />
      </div>
    </div>
  );
}
