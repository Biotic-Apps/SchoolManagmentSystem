"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageSquareText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { MiniFrame, Tag } from "./MiniFrame";
import { useMiniLoop } from "./useMiniLoop";

type MiniProps = { labels: readonly string[]; color: string };
const pop = { initial: { opacity: 0, y: 8, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, scale: 0.9 } };

/** 7:30 AM: a gate pass with a code that turns valid. */
export function MiniGate({ labels, color }: MiniProps) {
  const { ref, frame } = useMiniLoop(2, 1800);
  return (
    <MiniFrame frameRef={ref}>
      <div className="flex h-full items-center gap-3">
        <div className="grid size-16 shrink-0 grid-cols-4 gap-0.5 rounded-lg bg-surface-sunken p-1.5">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className={cn("rounded-[2px]", (i * 7) % 3 ? "bg-foreground/80" : "bg-transparent")} />
          ))}
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="font-semibold">{labels[0]}</p>
          <p className="text-faint">Class 5-B</p>
          <AnimatePresence mode="wait">
            {frame === 1 ? (
              <motion.span key="ok" {...pop} className="block">
                <Tag color={color}><ShieldCheck className="size-3" />{labels[1]}</Tag>
              </motion.span>
            ) : (
              <motion.span key="wait" {...pop} className="block text-faint">Checking...</motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MiniFrame>
  );
}

/** 8:05 AM: a register fills in, then the SMS to the absent child's parent pops. */
export function MiniAttendance({ labels, color }: MiniProps) {
  const { ref, frame } = useMiniLoop(7, 700);
  return (
    <MiniFrame frameRef={ref}>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "grid h-6 flex-1 place-items-center rounded-md border text-[0.62rem] font-bold transition-colors duration-300",
              i >= frame ? "border-line bg-white text-faint" : i === 2 ? "border-accent-200 bg-accent-50 text-accent-600" : "border-brand-200 bg-brand-50 text-brand-700",
            )}
          >
            {i < frame ? (i === 2 ? "A" : "P") : ""}
          </span>
        ))}
      </div>
      <AnimatePresence>
        {frame >= 5 ? (
          <motion.div {...pop} className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-lg bg-surface-sunken px-2.5 py-2 shadow-soft">
            <MessageSquareText className="size-4 shrink-0" style={{ color }} />
            <span className="truncate"><b>{labels[0]}:</b> {labels[1]}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MiniFrame>
  );
}

/** 9:00 AM: the absent teacher's slot is covered by a substitute. */
export function MiniSubstitute({ labels, color }: MiniProps) {
  const { ref, frame } = useMiniLoop(2, 1800);
  return (
    <MiniFrame frameRef={ref}>
      <div className="mb-2 flex items-center justify-between text-faint">
        <span>{labels[0]}</span><span>9:00 AM</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-line px-2.5 py-2">
        <span className="relative font-semibold">
          <span className={cn("transition-opacity duration-300", frame ? "opacity-30 line-through" : "opacity-100")}>{labels[1]}</span>
        </span>
        <AnimatePresence>
          {frame ? (
            <motion.span {...pop}><Tag color={color}><Check className="size-3" />{labels[2]}</Tag></motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </MiniFrame>
  );
}

/** 11:30 AM: a receipt is checked and marked verified. */
export function MiniProof({ labels, color }: MiniProps) {
  const { ref, frame } = useMiniLoop(3, 1200);
  return (
    <MiniFrame frameRef={ref}>
      <div className="flex items-center justify-between">
        <span className="text-faint">Bank receipt</span>
        <span className="font-semibold tabular-nums">{labels[0]}</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-field">
        <div
          className="h-full origin-left rounded-full transition-transform duration-1000 ease-out"
          style={{ backgroundColor: color, transform: `scaleX(${frame === 0 ? 0.05 : 1})` }}
        />
      </div>
      <div className="mt-3 h-6">
        <AnimatePresence>
          {frame === 2 ? (
            <motion.span {...pop} className="block"><Tag color={color}><Check className="size-3" />{labels[1]}</Tag></motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </MiniFrame>
  );
}
