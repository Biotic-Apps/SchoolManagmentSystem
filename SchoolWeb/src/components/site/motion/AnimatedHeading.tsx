"use client";

import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";

type HeadingTag = "h1" | "h2" | "h3";

type AnimatedHeadingProps = {
  text: string;
  as?: HeadingTag;
  className?: string;
  delay?: number;
};

/**
 * Headings that rise into place a word at a time, each one rotating up from
 * behind its own baseline. The rotation is real 3D: the heading carries the
 * perspective and each word pivots on `rotateX`, so they arrive at an angle
 * rather than simply sliding.
 *
 * The viewport trigger has to sit on the heading, not on the words. Each word
 * starts fully below its clipping mask, and an IntersectionObserver applies
 * ancestor clipping when it measures — so a word inside `overflow: hidden`
 * reports zero intersection and `whileInView` on it would never fire at all.
 * The heading itself is unclipped, so it triggers reliably and staggers its
 * children from there.
 */
const container: Variants = {
  hidden: {},
  shown: (delay: number) => ({
    transition: { staggerChildren: 0.055, delayChildren: delay },
  }),
};

const word: Variants = {
  hidden: { y: "108%", rotateX: -62, opacity: 0 },
  shown: {
    y: "0%",
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AnimatedHeading({
  text,
  as = "h2",
  className,
  delay = 0,
}: AnimatedHeadingProps) {
  const MotionTag = motion[as];
  const words = text.split(" ");

  return (
    <MotionTag
      className={className}
      style={{ perspective: "900px" }}
      variants={container}
      custom={delay}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {words.map((item, index) => (
        // A real space between the words, not a padded gap.
        //
        // The gap used to be `pr-[0.26em]` on the word itself, which looks
        // identical and is not the same thing: with no whitespace text node
        // between the spans, selecting the heading and copying it produced
        // `Runyourentirebusiness…`. Search engines and screen readers read the
        // same run-on. A space in the source costs nothing and fixes both.
        <Fragment key={`${item}-${index}`}>
          <span
            // Clips the word while it is still below its line. The padding is
            // what gives descenders — the y in "your", the p in "place" — room
            // to sit inside the clip instead of being sheared off at the
            // baseline; the matching negative margin keeps the line box the
            // size it would otherwise have been.
            className="inline-block overflow-hidden pb-[0.18em] -mb-[0.18em] align-bottom"
          >
            <motion.span
              data-motion
              variants={word}
              className="inline-block"
              style={{ transformOrigin: "50% 100%" }}
            >
              {item}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </MotionTag>
  );
}
