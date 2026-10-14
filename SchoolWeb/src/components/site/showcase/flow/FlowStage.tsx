"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { EASE, ROW_QUERY } from "./flowStyle";

/**
 * Holds one stage and rises it into place. In the stacked layout a stage plays
 * when it scrolls into view; in the row layout the scroll hook decides instead,
 * so this stays out of its way.
 */
export function FlowStage({
  index,
  onSeen,
  children,
}: {
  index: number;
  onSeen: (index: number) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -25% 0px" });

  useEffect(() => {
    if (inView && !window.matchMedia(ROW_QUERY).matches) onSeen(index);
  }, [inView, index, onSeen]);

  return (
    <motion.div
      ref={ref}
      data-motion
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: EASE }}
      className="h-full min-w-0"
    >
      {children}
    </motion.div>
  );
}
