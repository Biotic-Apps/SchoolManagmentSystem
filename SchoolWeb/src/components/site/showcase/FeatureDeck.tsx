"use client";

import { Fragment, useRef } from "react";
import { cn } from "@/lib/site/cn";
import { FEATURES } from "./features";
import { FeatureCard } from "./FeatureCard";
import { useDeckScroll } from "./useDeckScroll";

/**
 * The four feature showcases as a deck of cards. On a desktop each card is
 * sticky, so the next one slides up over it while the one beneath sinks back,
 * dims and softens. Below that, or on a screen too short to hold a card, they
 * are simply cards in a column.
 */
export function FeatureDeck() {
  const marks = useRef<Array<HTMLDivElement | null>>([]);
  const slots = useRef<Array<HTMLDivElement | null>>([]);
  const cards = useRef<Array<HTMLDivElement | null>>([]);
  const veils = useRef<Array<HTMLDivElement | null>>([]);
  const bars = useRef<Array<HTMLSpanElement | null>>([]);

  useDeckScroll({ marks, slots, cards, veils, bars });

  return (
    <section
      id="features"
      className="relative overflow-x-clip bg-surface-sunken py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-8 [@media(min-width:1024px)_and_(min-height:700px)]:pb-[8vh]">
        {FEATURES.map((feature, index) => (
          <Fragment key={feature.id}>
            {/* The anchor, and the deck's measuring stick: it sits exactly where
              the card does in the flow but is never sticky, so it always
              reports its true position. */}
            <div
              id={feature.id}
              aria-hidden
              ref={(node) => {
                marks.current[index] = node;
              }}
              className={cn(
                "h-0",
                index > 0 &&
                  "mt-6 sm:mt-8 [@media(min-width:1024px)_and_(min-height:700px)]:mt-[14vh]",
              )}
            />
            <div
              ref={(node) => {
                slots.current[index] = node;
              }}
              className="[@media(min-width:1024px)_and_(min-height:700px)]:sticky [@media(min-width:1024px)_and_(min-height:700px)]:h-[min(720px,calc(100svh-var(--site-header-height)-5rem))]"
              style={{
                top: `calc(var(--site-header-height) + 1.75rem + ${index * 14}px)`,
              }}
            >
              <FeatureCard
                feature={feature}
                index={index}
                total={FEATURES.length}
                cardRef={(node) => {
                  cards.current[index] = node;
                }}
                veilRef={(node) => {
                  veils.current[index] = node;
                }}
                barRef={(node) => {
                  bars.current[index] = node;
                }}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
