"use client";

import { forwardRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import type { ModuleEntry } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { MODULE_ICONS, TONE_GRADIENTS } from "@/components/site/modules/moduleIcons";

/* The glow ring: a radial gradient at the cursor, masked down to a 1px frame. */
const RING_STYLE: CSSProperties = {
  background:
    "radial-gradient(260px circle at var(--spot-x, -999px) var(--spot-y, -999px), rgb(123 104 238 / 0.95), rgb(236 72 153 / 0.45) 40%, transparent 70%)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
  padding: 1,
};

/* The soft light inside the card that follows the cursor. */
const GLOW_STYLE: CSSProperties = {
  background:
    "radial-gradient(340px circle at var(--spot-x, -999px) var(--spot-y, -999px), rgb(123 104 238 / 0.13), transparent 65%)",
};

type ModuleCardProps = { entry: ModuleEntry; wide: boolean };

/**
 * One tile of the bento. `forwardRef` because `AnimatePresence` in
 * `popLayout` mode has to measure the card as it leaves.
 */
export const ModuleCard = forwardRef<HTMLElement, ModuleCardProps>(function ModuleCard(
  { entry, wide },
  ref,
) {
  const Icon = MODULE_ICONS[entry.icon];
  const parts = entry.detail.split(" · ");

  return (
    <motion.article
      ref={ref}
      layout
      data-spot
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
      className={cn(
        "group relative isolate overflow-hidden rounded-[1.35rem] bg-surface p-6 ring-1 ring-inset ring-line",
        "shadow-[0_1px_2px_rgb(42_31_107/0.04),0_14px_30px_-22px_rgb(42_31_107/0.35)]",
        wide && "sm:col-span-2",
      )}
    >
      <span
        aria-hidden
        style={GLOW_STYLE}
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span
        aria-hidden
        style={RING_STYLE}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/grid:opacity-100"
      />

      {wide ? (
        <Icon
          aria-hidden
          strokeWidth={1.2}
          className="pointer-events-none absolute -bottom-8 -right-6 -z-10 size-40 text-brand-500/[0.07] transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-110"
        />
      ) : null}

      <div className={cn("flex h-full gap-4", wide ? "flex-col sm:flex-row sm:items-center" : "flex-col")}>
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white",
            "transition-transform duration-500 ease-[cubic-bezier(0.34,1.7,0.64,1)] group-hover:-translate-y-1 group-hover:rotate-[-12deg] group-hover:scale-110",
            TONE_GRADIENTS[entry.tone],
          )}
        >
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </span>

        <div className="min-w-0">
          <h3 className={cn("font-semibold tracking-tight", wide ? "text-[1.12rem]" : "text-[0.98rem]")}>
            {entry.name}
          </h3>
          {wide ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {parts.map((part) => (
                <li
                  key={part}
                  className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.74rem] font-medium text-brand-700 ring-1 ring-inset ring-brand-100"
                >
                  {part}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted">{parts.join(", ")}</p>
          )}
        </div>
      </div>
    </motion.article>
  );
});
