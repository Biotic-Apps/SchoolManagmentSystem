"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { FLOW_COPY, FLOW_DEMO } from "@/lib/site/content";
import { EASE } from "./flowStyle";

/** Stage two: the absent child's parent gets a push alert and an SMS. */
export function ParentMessage({ step }: { step: number }) {
  const shown = step >= 2;
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {shown && (
          <motion.div
            key="push"
            data-motion
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow-lift)]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Bell className="size-4" strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold">{FLOW_COPY.pushTitle}</span>
                <span className="text-faint">{FLOW_COPY.smsTime}</span>
              </span>
              <span className="mt-0.5 block text-[0.8rem] leading-snug text-muted">
                {FLOW_DEMO.absentName} · {FLOW_DEMO.className}
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl bg-surface-sunken p-3.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-faint">
          SMS · {FLOW_COPY.smsFrom}
        </p>
        <motion.div
          data-motion
          initial={false}
          animate={shown ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.5, delay: shown ? 0.45 : 0, ease: EASE }}
          className="mt-2.5 max-w-[95%] rounded-2xl rounded-tl-sm bg-surface p-3 text-[0.84rem] leading-relaxed shadow-[var(--shadow-card)]"
        >
          {FLOW_DEMO.sms}
          <span className="mt-1.5 block text-right text-[0.68rem] text-faint">
            {FLOW_DEMO.sentAt}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
