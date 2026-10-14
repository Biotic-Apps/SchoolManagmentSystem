"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/site/cn";
import type { Feature } from "./features";
import { FeaturePoints } from "./FeaturePoints";
import { FeatureScreen } from "./FeatureScreen";
import { DeckCounter } from "./DeckCounter";

type FeatureCardProps = {
  feature: Feature;
  index: number;
  total: number;
  cardRef: (node: HTMLDivElement | null) => void;
  veilRef: (node: HTMLDivElement | null) => void;
  barRef: (node: HTMLSpanElement | null) => void;
};

/**
 * One card of the deck: copy and points on the left, the product on the right
 * (under the copy on small screens). Its content plays in the first time the
 * card is mostly on screen, which on desktop is the moment it slides over the
 * card before it.
 */
export function FeatureCard({
  feature,
  index,
  total,
  cardRef,
  veilRef,
  barRef,
}: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });

  return (
    <div
      ref={(node) => {
        ref.current = node;
        cardRef(node);
      }}
      className="relative h-full origin-top overflow-hidden rounded-[32px] border border-brand-200/70 bg-surface shadow-[0_30px_80px_-40px_rgb(42_31_107/0.45)] will-change-transform"
    >
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", feature.wash)}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none text-[11rem] font-bold leading-none tracking-[-0.06em] text-brand-900/[0.04] sm:text-[14rem]"
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="relative grid h-full items-center gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12 lg:p-12">
        <div className="min-w-0">
          <DeckCounter index={index} total={total} barRef={barRef} />
          <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
            {feature.eyebrow}
          </p>
          <h3 className="mt-3 text-balance text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[2.1rem] lg:text-[2.2rem]">
            {feature.title}
          </h3>
          <p className="mt-4 max-w-xl text-pretty text-[0.98rem] leading-[1.6] text-muted">
            {feature.body}
          </p>
          <FeaturePoints feature={feature} shown={shown} />
        </div>
        <FeatureScreen feature={feature} shown={shown} />
      </div>

      <div
        ref={veilRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#1b1440]/25 opacity-0"
      />
    </div>
  );
}
