"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/site/cn";
import { prefersReducedMotion } from "@/lib/site/gsap";

type BentoCardProps = {
  children: ReactNode;
  /** Position in the grid, used to stagger the rise. */
  index: number;
  className?: string;
};

const MAX_TILT = 5;

/**
 * One cell of the stats bento. It rises into place in turn with its
 * neighbours, then leans a few degrees toward the cursor while hovered. The
 * rise and the tilt sit on separate elements so they never fight over the
 * same transform, and the tilt is written to the DOM directly.
 */
export function BentoCard({ children, index, className }: BentoCardProps) {
  const tilt = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = tilt.current;
    if (!node || event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    node.style.transform = `rotateX(${(-y * MAX_TILT).toFixed(2)}deg) rotateY(${(x * MAX_TILT).toFixed(2)}deg) translateZ(0)`;
    node.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    node.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const onLeave = () => {
    if (tilt.current) tilt.current.style.transform = "";
  };

  return (
    <motion.div
      data-motion
      className={cn("[perspective:1000px]", className)}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={tilt}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn(
          "group relative h-full overflow-hidden rounded-[1.4rem] border border-line bg-surface p-5 sm:p-6",
          "shadow-[0_1px_2px_rgb(42_31_107/0.04),0_18px_40px_-28px_rgb(42_31_107/0.35)]",
          "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:border-brand-200 hover:shadow-[0_1px_2px_rgb(42_31_107/0.05),0_28px_50px_-26px_rgb(123_104_238/0.45)]",
        )}
      >
        {/* A soft light that follows the cursor across the card. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--glow-x, 50%) var(--glow-y, 0%), rgb(123 104 238 / 0.09), transparent 60%)",
          }}
        />
        <div className="relative h-full">{children}</div>
      </div>
    </motion.div>
  );
}
