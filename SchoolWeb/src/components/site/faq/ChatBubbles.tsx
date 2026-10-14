"use client";

import { motion, type Variants } from "framer-motion";
import { FAQ_COPY } from "@/lib/site/content";

const list: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.55, delayChildren: 0.3 } },
};

const bubble: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.85 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
};

const DOT_DELAYS = [0, 150, 300];

/**
 * A tiny conversation beside the questions: a parent asks, the school answers,
 * and three dots keep typing. Bubbles pop in one after another as it scrolls
 * into view; the dots bounce on the CSS clock, which reduced motion stops.
 */
export function ChatBubbles() {
  return (
    <motion.div
      aria-hidden
      variants={list}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      className="relative mt-10 hidden max-w-sm overflow-hidden rounded-[1.4rem] bg-surface p-5 shadow-[0_24px_50px_-30px_rgb(42_31_107/0.5)] ring-1 ring-line sm:block"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-brand-300/30 blur-2xl" />

      <motion.div data-motion variants={bubble} className="relative flex items-end gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-100 text-[0.65rem] font-bold text-accent-700">
          P
        </span>
        <div>
          <p className="mb-1 text-[0.68rem] font-semibold text-faint">{FAQ_COPY.chatFrom}</p>
          <p className="rounded-2xl rounded-bl-md bg-surface-sunken px-3.5 py-2.5 text-[0.84rem] leading-snug ring-1 ring-inset ring-line">
            {FAQ_COPY.chatQuestion}
          </p>
        </div>
      </motion.div>

      <motion.div
        data-motion
        variants={bubble}
        className="relative mt-4 flex flex-row-reverse items-end gap-2"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-[0.65rem] font-bold text-white">
          e
        </span>
        <div className="text-right">
          <p className="mb-1 text-[0.68rem] font-semibold text-faint">{FAQ_COPY.chatReplyFrom}</p>
          <p className="gradient-button rounded-2xl rounded-br-md px-3.5 py-2.5 text-left text-[0.84rem] leading-snug text-white">
            {FAQ_COPY.chatReply}
          </p>
        </div>
      </motion.div>

      <motion.div data-motion variants={bubble} className="relative mt-4 flex items-center gap-3">
        <span className="flex gap-1 rounded-full bg-surface-sunken px-3 py-2.5 ring-1 ring-inset ring-line">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="size-1.5 animate-bounce rounded-full bg-brand-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className="text-[0.74rem] font-medium text-brand-700">{FAQ_COPY.chatMore}</span>
      </motion.div>
    </motion.div>
  );
}
