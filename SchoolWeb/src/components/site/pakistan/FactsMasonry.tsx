"use client";

import { motion, type Variants } from "framer-motion";
import { PAKISTAN_FACTS } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { FactCard } from "./FactCard";

const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/**
 * Stagger offsets: on two columns the right column drops, on three the middle
 * one does. They sit on a wrapper so the card's own 3D flip owns its transform.
 */
const LG = ["lg:translate-y-0", "lg:translate-y-14", "lg:translate-y-6"];

function offset(index: number) {
  return cn(
    "[perspective:1200px]",
    index % 2 === 1 ? "sm:translate-y-10" : "sm:translate-y-0",
    LG[index % 3],
  );
}

/** The six facts as glass cards in a staggered grid that flips up into view. */
export function FactsMasonry() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      className="grid gap-5 pb-10 sm:grid-cols-2 lg:grid-cols-3 lg:pb-14"
    >
      {PAKISTAN_FACTS.map((fact, index) => (
        <div key={fact.label} className={offset(index)}>
          <FactCard fact={fact} />
        </div>
      ))}
    </motion.div>
  );
}
