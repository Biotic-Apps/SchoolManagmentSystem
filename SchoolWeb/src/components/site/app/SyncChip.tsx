"use client";

import { motion } from "framer-motion";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { ANDROID_APP_COPY as COPY } from "@/lib/site/content";
import type { SyncPhase } from "./useSyncCycle";

/**
 * The Offline / Online pill. The label flips like a card turning over, and
 * while it syncs the arrows spin and the pending count runs down.
 */
export function SyncChip({
  phase,
  pending,
  className,
}: {
  phase: SyncPhase;
  pending: number;
  className?: string;
}) {
  const online = phase !== "offline";
  const Icon = online ? Wifi : WifiOff;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white py-1.5 pl-1.5 pr-3.5 text-[0.72rem] font-semibold text-foreground",
        "shadow-[0_18px_40px_-16px_rgb(20_10_60/0.7)]",
        className,
      )}
    >
      <motion.span
        data-motion
        key={online ? "on" : "off"}
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white",
          online ? "bg-emerald-600" : "bg-slate-500",
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.4} />
        {online ? COPY.online : COPY.offline}
      </motion.span>
      <span className="inline-flex items-center gap-1.5 tabular-nums text-muted">
        <RefreshCw
          className={cn("size-3.5 text-brand-500", phase === "syncing" && "animate-spin")}
          strokeWidth={2.4}
        />
        <span className="w-[1.3rem] text-right text-foreground">{pending}</span>
        {COPY.pending}
      </span>
    </div>
  );
}
