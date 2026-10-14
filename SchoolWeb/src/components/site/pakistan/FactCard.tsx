"use client";

import { motion, type Variants } from "framer-motion";
import {
  Banknote,
  Building2,
  CalendarRange,
  Clock,
  MessageSquareText,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import type { PAKISTAN_FACTS } from "@/lib/site/content";

type Fact = (typeof PAKISTAN_FACTS)[number];

const ICONS: Record<Fact["icon"], LucideIcon> = {
  Banknote,
  CalendarRange,
  Clock,
  MessageSquareText,
  WifiOff,
  Building2,
};

/** Each icon gets its own hover gesture so the six cards do not move alike. */
const HOVER: Record<Fact["icon"], string> = {
  Banknote: "group-hover:-rotate-12 group-hover:scale-110",
  CalendarRange: "group-hover:-translate-y-1 group-hover:scale-110",
  Clock: "group-hover:rotate-[360deg]",
  MessageSquareText: "group-hover:-translate-y-1 group-hover:rotate-6",
  WifiOff: "group-hover:scale-125",
  Building2: "group-hover:-translate-y-1.5",
};

/** The 3D flip-up: each card swings forward from lying flat, hinged on its top edge. */
export const flipUp: Variants = {
  hidden: { opacity: 0, rotateX: -78, y: 40 },
  shown: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FactCard({ fact }: { fact: Fact }) {
  const Icon = ICONS[fact.icon] ?? Banknote;

  return (
    <motion.article
      data-motion
      variants={flipUp}
      style={{ transformOrigin: "50% 0%" }}
      className="group relative overflow-hidden rounded-[1.4rem] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-md transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.1] sm:p-7"
    >
      {/* A soft glow that wakes up behind the icon on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-accent-500/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-4">
        <p className="bg-gradient-to-br from-white to-brand-200 bg-clip-text text-[2.2rem] font-semibold leading-none tracking-[-0.04em] text-transparent">
          {fact.value}
        </p>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400/40 to-accent-500/30 ring-1 ring-white/15">
          <Icon
            className={`size-5 text-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${HOVER[fact.icon]}`}
            strokeWidth={2}
          />
        </span>
      </div>
      <h3 className="relative mt-6 text-[1.05rem] font-semibold tracking-tight text-white">
        {fact.label}
      </h3>
      <p className="relative mt-2 text-pretty text-[0.92rem] leading-relaxed text-brand-100/75">
        {fact.body}
      </p>
    </motion.article>
  );
}
