"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { RotatingWord } from "./RotatingWord";

type HeroHeadlineProps = {
  /** The whole sentence, read by screen readers and search engines. */
  label: string;
  lead: string;
  rotating: readonly string[];
  className?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The hero h1: a static first line whose words rise out of their own masks on
 * load, then a second line that keeps cycling through what the school runs.
 *
 * The visual version is hidden from assistive tech, because a sentence that
 * changes every two seconds is noise when read aloud. The full sentence is
 * given once, as text, in its place.
 */
export function HeroHeadline({ label, lead, rotating, className }: HeroHeadlineProps) {
  const words = lead.split(" ");

  return (
    <h1 className={className}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="block">
        <span className="block">
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                <motion.span
                  data-motion
                  className="inline-block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.1 + index * 0.08, ease: EASE }}
                >
                  {word}
                </motion.span>
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </span>
        <motion.span
          data-motion
          className="block"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1 + words.length * 0.08, ease: EASE }}
        >
          <RotatingWord words={rotating} delay={1.2} />
        </motion.span>
      </span>
    </h1>
  );
}
