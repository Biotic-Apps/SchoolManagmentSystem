"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { DocChips } from "./DocChips";
import { DOCS, FAN_STAGE, type DocId } from "./registry";
import { useFitScale } from "./useFitScale";

const SPRING = { type: "spring", stiffness: 160, damping: 22, mass: 0.9 } as const;

/**
 * Desktop and tablet: the documents wait as a loose pile, spread into a fan
 * once the section is on screen, and the one under the pointer (or picked from
 * the chips) lifts to the front and straightens. Transform only.
 */
export function DocFan() {
  const [ref, scale] = useFitScale<HTMLDivElement>(FAN_STAGE.w);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduced = useReducedMotion();
  const [active, setActive] = useState<DocId | null>(null);
  const spread = inView || Boolean(reduced);

  return (
    <div>
      <div ref={ref} className="relative w-full" style={{ height: FAN_STAGE.h * scale }}>
        <div
          className="absolute left-1/2 top-0 origin-top"
          style={{ width: FAN_STAGE.w, height: FAN_STAGE.h, transform: `translateX(-50%) scale(${scale})` }}
        >
          <div aria-hidden className="absolute inset-x-[12%] bottom-[6%] top-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(123_104_238/0.16),transparent)]" />
          {DOCS.map(({ id, w, h, Doc, fan, stack }, i) => {
            const on = active === id;
            const pose = spread ? fan : stack;
            return (
              <motion.div
                key={id}
                data-motion
                onMouseEnter={() => setActive(id)}
                className="absolute left-1/2 top-1/2 cursor-default"
                style={{ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, zIndex: on ? 20 : i + 1 }}
                initial={false}
                animate={{
                  x: pose.x,
                  y: pose.y + (on ? -16 : 0),
                  rotate: on ? 0 : pose.rotate,
                  scale: on ? 1.04 : 1,
                }}
                transition={reduced ? { duration: 0 } : { ...SPRING, delay: active === null && spread ? 0.15 + i * 0.09 : 0 }}
              >
                <Doc />
              </motion.div>
            );
          })}
        </div>
      </div>
      <DocChips active={active} onSelect={setActive} className="mt-6" />
    </div>
  );
}
