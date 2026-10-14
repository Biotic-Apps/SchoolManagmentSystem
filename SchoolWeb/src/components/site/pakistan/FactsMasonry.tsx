"use client";

import { motion, type Variants } from "framer-motion";
import { PAKISTAN_FACTS } from "@/lib/site/content";
import { FactCard } from "./FactCard";

const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/** The six facts as glass cards in an even, aligned grid that flips up into view. */
export function FactsMasonry() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {PAKISTAN_FACTS.map((fact) => (
        <div key={fact.label} className="h-full [perspective:1200px]">
          <FactCard fact={fact} />
        </div>
      ))}
    </motion.div>
  );
}
