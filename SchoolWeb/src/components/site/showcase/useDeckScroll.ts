"use client";

import { useEffect, type RefObject } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/site/gsap";
import { refreshScrollTriggers } from "@/lib/site/scroll";
import { DECK_QUERY } from "./features";

type DeckRefs = {
  /** A zero height, never sticky marker where each card sits in the flow. */
  marks: RefObject<Array<HTMLDivElement | null>>;
  /** Each sticky slot, in order. */
  slots: RefObject<Array<HTMLDivElement | null>>;
  /** The element inside each slot that is scaled and dimmed (no blur: filtering a full card every scroll frame stutters). */
  cards: RefObject<Array<HTMLDivElement | null>>;
  /** The dimming veil inside each card. */
  veils: RefObject<Array<HTMLDivElement | null>>;
  /** Every progress bar fill, one per card, all showing the same value. */
  bars: RefObject<Array<HTMLSpanElement | null>>;
};

/**
 * Drives the deck of cards.
 *
 * The slots are `position: sticky`, and a stuck element reports where it is
 * stuck rather than where it sits in the flow, which would give ScrollTrigger
 * the wrong start points. So every trigger position is read from a zero height marker
 * placed just before each slot (never sticky), through function based
 * `start`/`end` values that ScrollTrigger re-runs on every refresh.
 */
export function useDeckScroll({ marks, slots, cards, veils, bars }: DeckRefs) {
  useEffect(() => {
    const media = gsap.matchMedia();

    media.add(DECK_QUERY, () => {
      const reduced = prefersReducedMotion();
      const list = slots.current.filter(Boolean) as HTMLDivElement[];
      const count = list.length;

      /** Scroll position at which slot `i` arrives at its sticky top. */
      const stuckAt = (i: number) => {
        const mark = marks.current[i];
        if (!mark) return 0;
        const flowTop = mark.getBoundingClientRect().top + window.scrollY;
        return flowTop - parseFloat(getComputedStyle(list[i]).top);
      };

      // One progress value for the deck: card one settling to card four settling.
      ScrollTrigger.create({
        start: () => stuckAt(0),
        end: () => stuckAt(count - 1),
        onUpdate: (self) => {
          bars.current.forEach((bar) => {
            if (bar)
              bar.style.transform = `scaleX(${0.25 + self.progress * 0.75})`;
          });
        },
      });

      if (reduced) return;

      // Every card but the last gives way to the one sliding over it.
      for (let i = 0; i < count - 1; i += 1) {
        const card = cards.current[i];
        const veil = veils.current[i];
        if (!card || !veil) continue;
        const range = {
          start: () => stuckAt(i + 1) - window.innerHeight * 0.85,
          end: () => stuckAt(i + 1),
          scrub: 0.4,
        };
        gsap.fromTo(
          card,
          { scale: 1 },
          {
            scale: 0.92,
            ease: "none",
            scrollTrigger: { ...range },
          },
        );
        gsap.fromTo(
          veil,
          { opacity: 0 },
          { opacity: 1, ease: "none", scrollTrigger: { ...range } },
        );
      }
    });

    refreshScrollTriggers();
    return () => media.revert();
  }, [marks, slots, cards, veils, bars]);
}
