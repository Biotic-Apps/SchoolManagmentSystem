"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Reveal } from "@/components/site/motion/Reveal";
import { TRUST_POINTS } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { ShieldLock } from "./ShieldLock";
import { TrustPoint } from "./TrustPoint";
import { ConnectorLines } from "./ConnectorLines";
import { useConnectors } from "./useConnectors";

/** The two dashed rings that turn slowly around the shield. */
function OrbitRings() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-[-28%]">
      <motion.div
        data-motion
        className="absolute inset-0 rounded-full border border-dashed border-brand-300/70"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
      />
      <motion.div
        data-motion
        className="absolute inset-[14%] rounded-full border border-brand-200"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400 shadow-[0_0_12px_#f472b6]" />
      </motion.div>
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgb(167_139_250/0.28),transparent)]" />
    </div>
  );
}

/**
 * Desktop layout: the shield in the middle, three points either side on a
 * gentle arc (the middle card of each column sits further out), each tied to
 * the shield by a measured connector. Hovering a card lights up its line.
 */
export function TrustOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const drawn = useInView(containerRef, {
    once: true,
    margin: "0px 0px -20% 0px",
  });
  const geometry = useConnectors(containerRef, shieldRef, cardRefs);

  const column = (indexes: number[], side: "left" | "right") => (
    <div
      className={cn(
        "flex flex-col gap-8",
        side === "left" ? "items-end" : "items-start",
      )}
    >
      {indexes.map((i, row) => {
        const point = TRUST_POINTS[i];
        if (!point) return null;
        return (
          <div
            key={point.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              "w-full max-w-[20rem]",
              row === 1 && (side === "left" ? "mr-14" : "ml-14"),
            )}
          >
            <Reveal delay={0.3 + row * 0.12}>
              <TrustPoint
                point={point}
                active={active === i}
                align={side === "left" ? "right" : "left"}
              />
            </Reveal>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative hidden grid-cols-[minmax(0,1fr)_17rem_minmax(0,1fr)] items-center gap-x-20 lg:grid"
    >
      <ConnectorLines {...geometry} active={active} drawn={drawn} />
      {column([0, 1, 2], "left")}
      <div ref={shieldRef} className="relative mx-auto w-full">
        <OrbitRings />
        <ShieldLock className="relative mx-auto w-[13rem]" />
      </div>
      {column([3, 4, 5], "right")}
    </div>
  );
}
