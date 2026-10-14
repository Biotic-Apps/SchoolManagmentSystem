"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { ANDROID_APP_COPY as COPY } from "@/lib/site/content";
import { PENDING_TOTAL } from "./useSyncCycle";

/** "Synced, 34 records": slides in from the side once the count reaches 0. */
export function SyncedToast({ show, className }: { show: boolean; className?: string }) {
  return (
    <div className={cn("pointer-events-none", className)}>
      <AnimatePresence>
        {show ? (
          <motion.div
            data-motion
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-center gap-2.5 rounded-2xl bg-white py-2 pl-2 pr-4 shadow-[0_18px_40px_-16px_rgb(20_10_60/0.7)]"
          >
            <span className="grid size-7 place-items-center rounded-full bg-emerald-600 text-white">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.74rem] font-semibold text-foreground">{COPY.synced}</span>
              <span className="block text-[0.68rem] tabular-nums text-muted">
                {PENDING_TOTAL} {COPY.records}
              </span>
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
