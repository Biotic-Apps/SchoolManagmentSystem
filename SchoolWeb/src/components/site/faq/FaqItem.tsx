"use client";

import { motion } from "framer-motion";
import { PlusMinus } from "@/components/site/faq/PlusMinus";
import { refreshScrollTriggers } from "@/lib/site/scroll";
import { cn } from "@/lib/site/cn";

type FaqItemProps = {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
  baseId: string;
  index: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One question as a card. The answer stays **mounted** when closed (height 0)
 * so every answer is in the served HTML and indexed; the `<noscript>` rule in
 * the site layout opens `[data-faq-panel]` for visitors without JavaScript.
 *
 * Opening changes the page height, so scroll-driven sections below are asked
 * to re-measure once the animation settles.
 */
export function FaqItem({ q, a, open, onToggle, baseId, index }: FaqItemProps) {
  const panelId = `${baseId}-panel-${index}`;
  const buttonId = `${baseId}-button-${index}`;

  return (
    <motion.div
      animate={{ y: open ? -3 : 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-surface ring-1 ring-inset transition-[box-shadow] duration-300",
        open
          ? "shadow-[0_18px_40px_-22px_rgb(91_75_199/0.55)] ring-brand-200"
          : "shadow-[0_1px_2px_rgb(42_31_107/0.04)] ring-line hover:ring-brand-200",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1 origin-top bg-gradient-to-b from-brand-400 via-brand-600 to-accent-500 transition-transform duration-500",
          open ? "scale-y-100" : "scale-y-0",
        )}
      />
      <h3>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6"
        >
          <span
            className={cn(
              "flex-1 pt-1 font-semibold tracking-tight transition-colors duration-300",
              open && "text-brand-800",
            )}
          >
            {q}
          </span>
          <PlusMinus open={open} />
        </button>
      </h3>

      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        data-faq-panel
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.3 } }}
        onAnimationComplete={refreshScrollTriggers}
        className="overflow-hidden"
      >
        <p className="px-5 pb-6 pr-14 text-pretty leading-relaxed text-muted sm:px-6 sm:pr-16">
          {a}
        </p>
      </motion.div>
    </motion.div>
  );
}
