"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { FLOW_COPY, FLOW_DEMO } from "@/lib/site/content";
import { EASE, STATUS_LABEL, STATUS_STYLE } from "./flowStyle";

/** Stage one: the class register being marked, one chip at a time. */
export function TeacherRegister({ step }: { step: number }) {
  const started = step >= 1;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-lg font-semibold tracking-tight">
          {FLOW_DEMO.className}
        </p>
        <p className="text-xs text-faint">{FLOW_DEMO.date}</p>
      </div>
      <ul className="mt-4 divide-y divide-dashed divide-line text-sm">
        {FLOW_DEMO.students.map((student, index) => (
          <li
            key={student.roll}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="font-mono text-xs text-faint">
                {student.roll}
              </span>
              <span className="truncate font-medium">{student.name}</span>
            </span>
            <motion.span
              data-motion
              initial={false}
              animate={
                started ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }
              }
              transition={{
                duration: 0.35,
                delay: started ? 0.2 + index * 0.24 : 0,
                ease: EASE,
              }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1",
                STATUS_STYLE[student.status],
              )}
            >
              {STATUS_LABEL[student.status]}
            </motion.span>
          </li>
        ))}
      </ul>
      <motion.div
        data-motion
        initial={false}
        animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.4, delay: started ? 1.5 : 0, ease: EASE }}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border-2 border-brand-500/60 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-brand-600"
      >
        <Check className="size-3.5" strokeWidth={3} />
        {FLOW_COPY.saved}
      </motion.div>
    </div>
  );
}
