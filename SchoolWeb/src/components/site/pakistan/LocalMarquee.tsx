"use client";

import { motion } from "framer-motion";
import { PAKISTAN_COPY } from "@/lib/site/content";

/**
 * A slow, endless strip of local touches. The list is rendered twice and the
 * track slides by exactly half its width, so the loop has no visible seam
 * (each chip carries its own right margin rather than the track a `gap`, so the
 * two halves are exactly equal). Only `transform` moves. With reduced motion,
 * MotionConfig and the `[data-motion]` rule in site.css hold the strip still.
 */
export function LocalMarquee() {
  const items = PAKISTAN_COPY.touches;

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <p className="sr-only">{items.join(", ")}</p>
      <motion.ul
        aria-hidden
        data-motion
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="mr-3 flex shrink-0 items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] px-5 py-2.5 text-[0.9rem] font-medium text-white/85"
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-gradient-to-br from-accent-400 to-brand-300"
            />
            {item}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
