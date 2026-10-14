"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/site/cn";

type NotificationChipProps = {
  icon: LucideIcon;
  title: string;
  meta: string;
  /** Seconds after load before the chip pops in. */
  delay: number;
  tone: "brand" | "accent";
  late?: boolean;
  className?: string;
};

const TONES = {
  brand: "from-brand-500 to-brand-700",
  accent: "from-accent-400 to-accent-600",
} as const;

/** A frosted toast that pops onto the composition, then bobs gently. */
export function NotificationChip({
  icon: Icon,
  title,
  meta,
  delay,
  tone,
  late = false,
  className,
}: NotificationChipProps) {
  return (
    <motion.div
      data-motion
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      initial={{ opacity: 0, scale: 0.6, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
    >
      <div className={cn("hero-bob", late && "hero-bob--late")}>
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/95 py-2 pl-2 pr-3.5 shadow-[0_14px_34px_-14px_rgb(42_31_107/0.45)]">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white",
              TONES[tone],
            )}
          >
            <Icon className="size-4" strokeWidth={2.4} />
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-[0.78rem] font-semibold leading-tight text-foreground">
              {title}
            </span>
            <span className="block whitespace-nowrap text-[0.68rem] leading-tight text-faint">{meta}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
