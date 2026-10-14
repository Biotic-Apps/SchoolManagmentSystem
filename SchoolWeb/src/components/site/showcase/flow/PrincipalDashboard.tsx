"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { CountUp } from "@/components/site/motion/CountUp";
import { FLOW_COPY, FLOW_DEMO } from "@/lib/site/content";
import { EASE } from "./flowStyle";

/** Stage three: the principal's numbers, already up to date. */
export function PrincipalDashboard({ step }: { step: number }) {
  const shown = step >= 3;
  const { totals, strength } = FLOW_DEMO;
  const presentShare = Math.round(
    ((totals.present + totals.late) / strength) * 100,
  );
  const rows = [
    {
      key: "present",
      label: FLOW_COPY.presentLabel,
      value: totals.present,
      tone: "bg-brand-500",
    },
    {
      key: "absent",
      label: FLOW_COPY.absentLabel,
      value: totals.absent,
      tone: "bg-accent-500",
    },
    {
      key: "late",
      label: FLOW_COPY.lateLabel,
      value: totals.late,
      tone: "bg-amber-500",
    },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-lg font-semibold tracking-tight">
          {FLOW_COPY.dashboardTitle}
        </p>
        <motion.span
          data-motion
          initial={false}
          animate={shown ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: shown ? 1.1 : 0 }}
          className="shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-[0.68rem] font-semibold text-brand-700"
        >
          {FLOW_COPY.updated} {FLOW_DEMO.sentAt}
        </motion.span>
      </div>

      <p className="mt-4 text-4xl font-bold tracking-tight tabular-nums">
        {shown ? (
          <CountUp
            value={presentShare}
            suffix="%"
            decimals={0}
            durationMs={1100}
          />
        ) : (
          "0"
        )}
      </p>

      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-sunken">
        {rows.map((row) => (
          <motion.span
            key={row.key}
            data-motion
            initial={false}
            animate={{
              width: shown ? `${(row.value / strength) * 100}%` : "0%",
            }}
            transition={{ duration: 0.9, delay: shown ? 0.2 : 0, ease: EASE }}
            className={cn("h-full", row.tone)}
          />
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
        {rows.map((row) => (
          <div
            key={row.key}
            className="rounded-xl bg-surface-sunken px-1 py-2.5"
          >
            <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-faint">
              {row.label}
            </dt>
            <dd className="mt-1 text-lg font-bold tabular-nums">
              {shown ? (
                <CountUp value={row.value} decimals={0} durationMs={1100} />
              ) : (
                "0"
              )}
            </dd>
          </div>
        ))}
      </dl>

      <motion.p
        data-motion
        initial={false}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.4, delay: shown ? 1.3 : 0, ease: EASE }}
        className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2.5 text-[0.8rem] text-muted"
      >
        <Bell className="size-3.5 shrink-0 text-brand-600" strokeWidth={2.2} />
        <span>
          {FLOW_COPY.alertsSent}{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {totals.absent}
          </span>
        </span>
      </motion.p>
    </div>
  );
}
