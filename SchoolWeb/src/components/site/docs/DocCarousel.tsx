"use client";

import { useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { PRINT_DOCS_COPY } from "@/lib/site/content";
import { DocChips } from "./DocChips";
import { DOCS, type DocId } from "./registry";
import { Scaled } from "./Scaled";
import { useFitScale } from "./useFitScale";

const SLIDE_H = 440;

/** One slide: the document shrunk to fit the slide width, centred. */
function Slide({ index }: { index: number }) {
  const { w, h, Doc } = DOCS[index];
  const [ref, fit] = useFitScale<HTMLDivElement>(w, 24);
  const scale = Math.min(fit, (SLIDE_H - 24) / h);
  return (
    <div ref={ref} className="flex w-full shrink-0 snap-center items-center justify-center overflow-hidden" style={{ height: SLIDE_H }}>
      <Scaled w={w} h={h} scale={scale}>
        <Doc />
      </Scaled>
    </div>
  );
}

/** Phones: one document at a time in a native, swipeable scroll-snap row. */
export function DocCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const select = (id: DocId) => {
    const el = track.current;
    const i = DOCS.findIndex((d) => d.id === id);
    if (!el || i < 0) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
    setIndex(i);
  };

  return (
    <div>
      <div
        ref={track}
        onScroll={onScroll}
        aria-label={PRINT_DOCS_COPY.swipeHint}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-panel bg-surface-sunken [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {DOCS.map((d, i) => (
          <Slide key={d.id} index={i} />
        ))}
      </div>
      <div aria-hidden className="mt-4 flex justify-center gap-0.5">
        {DOCS.map((d, i) => (
          <span
            key={d.id}
            className={`h-1.5 w-4 rounded-full transition-transform duration-300 ${i === index ? "bg-brand-500" : "scale-x-[0.4] bg-brand-200"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[0.78rem] text-faint">{PRINT_DOCS_COPY.swipeHint}</p>
      <DocChips active={DOCS[index]?.id ?? null} onSelect={select} className="mt-4" />
    </div>
  );
}
