"use client";

import { useState } from "react";
import { Reveal } from "@/components/site/motion/Reveal";
import { TRUST_POINTS } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { ShieldLock } from "./ShieldLock";
import { TrustIcon } from "./TrustPoint";

/**
 * Phones and tablets: the shield on top, then the six points as a list hung
 * from a single connector rail. Touching or hovering a point lights its node
 * and its stretch of the rail.
 */
export function TrustStack() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="lg:hidden">
      <ShieldLock className="mx-auto w-36 sm:w-44" />

      <ol className="relative mx-auto mt-12 max-w-xl">
        {TRUST_POINTS.map((point, i) => {
          const on = active === i;
          const last = i === TRUST_POINTS.length - 1;
          return (
            <li
              key={point.title}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onTouchStart={() => setActive(i)}
              className="relative pb-8 pl-16 last:pb-0"
            >
              {!last ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-5 top-10 w-px -translate-x-1/2 transition-colors duration-300",
                    on
                      ? "bg-gradient-to-b from-brand-500 to-accent-500"
                      : "bg-line-strong",
                  )}
                />
              ) : null}
              <span className="absolute left-0 top-0">
                <TrustIcon icon={point.icon} active={on} />
              </span>
              <Reveal delay={0.05}>
                <h3 className="pt-2 text-[1.02rem] font-semibold tracking-tight">
                  {point.title}
                </h3>
                <p className="mt-2 text-pretty text-[0.93rem] leading-[1.6] text-muted">
                  {point.body}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
