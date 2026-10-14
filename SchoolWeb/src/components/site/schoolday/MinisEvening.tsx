"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { MiniFrame } from "./MiniFrame";
import { useMiniLoop } from "./useMiniLoop";

type MiniProps = { labels: readonly string[]; color: string };
const pop = { initial: { opacity: 0, y: 8, scale: 0.92 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0 } };

/** A short list whose rows tick off one after another (diary and pickup). */
function TickList({ labels, color, title }: MiniProps & { title: string }) {
  const { ref, frame } = useMiniLoop(labels.length + 2, 800);
  return (
    <MiniFrame frameRef={ref}>
      <p className="mb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint">{title}</p>
      <ul className="space-y-1">
        {labels.map((label, i) => {
          const done = i < frame;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className="grid size-4 place-items-center rounded-[5px] border transition-colors duration-300"
                style={done ? { backgroundColor: color, borderColor: color } : { borderColor: "var(--color-line-strong)" }}
              >
                <Check className={cn("size-2.5 text-white transition-transform duration-300", done ? "scale-100" : "scale-0")} />
              </span>
              <span className={cn("transition-colors duration-300", done ? "text-foreground" : "text-faint")}>{label}</span>
            </li>
          );
        })}
      </ul>
    </MiniFrame>
  );
}

/** 1:30 PM: subjects get their diary and homework posted. */
export function MiniDiary(props: MiniProps) {
  return <TickList {...props} title="Diary posted" />;
}

/** 2:30 PM: children checked against the pickup list. */
export function MiniPickup(props: MiniProps) {
  return <TickList {...props} title="Pickup list" />;
}

const BARS = [
  [0.55, 0.8, 0.65, 0.9, 0.7],
  [0.7, 0.6, 0.85, 0.75, 0.95],
];

/** 4:00 PM: the day's numbers settle into a small bar chart. */
export function MiniDashboard({ labels, color }: MiniProps) {
  const { ref, frame } = useMiniLoop(2, 1800);
  return (
    <MiniFrame frameRef={ref}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{labels[0]}</span>
        <span className="text-faint">{labels[1]}</span>
      </div>
      <div className="mt-2 flex h-12 items-end gap-1.5">
        {BARS[frame].map((h, i) => (
          <span
            key={i}
            className="h-full flex-1 origin-bottom rounded-t-[4px] transition-transform duration-700 ease-out"
            style={{ backgroundColor: color, opacity: 0.45 + i * 0.12, transform: `scaleY(${h})` }}
          />
        ))}
      </div>
    </MiniFrame>
  );
}

/** 8:00 PM: a parent's question, a moment of typing, then the teacher's reply. */
export function MiniMessage({ labels, color }: MiniProps) {
  const { ref, frame } = useMiniLoop(3, 1300);
  return (
    <MiniFrame frameRef={ref}>
      <div className="flex h-full flex-col justify-end gap-1.5">
        <div className="max-w-[85%] self-end rounded-xl rounded-br-sm px-2.5 py-1.5 text-white" style={{ backgroundColor: color }}>
          {labels[0]}
        </div>
        <AnimatePresence mode="wait">
          {frame === 1 ? (
            <motion.div key="typing" {...pop} className="flex gap-1 self-start rounded-xl bg-surface-sunken px-2.5 py-2">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 animate-pulse rounded-full bg-faint" style={{ animationDelay: `${d * 150}ms` }} />
              ))}
            </motion.div>
          ) : frame === 2 ? (
            <motion.div key="reply" {...pop} className="max-w-[85%] self-start rounded-xl rounded-bl-sm bg-surface-sunken px-2.5 py-1.5">
              {labels[1]}
            </motion.div>
          ) : (
            <span key="none" className="h-[26px]" />
          )}
        </AnimatePresence>
      </div>
    </MiniFrame>
  );
}
