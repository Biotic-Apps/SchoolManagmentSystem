"use client";

import { FileSpreadsheet } from "lucide-react";
import { HOW_COPY } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { useLoopStep } from "./useLoopStep";

const COLS = "grid grid-cols-[1.3fr_0.55fr_1.2fr] gap-2";

/** Step 2: an Excel sheet flowing into the student table, a row at a time. */
export function ImportTable() {
  const rows = HOW_COPY.importRows;
  const { ref, step } = useLoopStep(rows.length, 600);

  return (
    <div
      ref={ref}
      aria-hidden
      className="rounded-xl border border-line bg-white p-4"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
          <FileSpreadsheet className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8rem] font-semibold">
            {HOW_COPY.importFile}
          </p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-field">
            <div
              className="h-full origin-left rounded-full bg-emerald-500 transition-transform duration-500 ease-out"
              style={{
                transform: `scaleX(${Math.max(0.06, step / rows.length)})`,
              }}
            />
          </div>
        </div>
        <span className="shrink-0 text-[0.7rem] font-semibold tabular-nums text-faint">
          {step} rows
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-line text-[0.74rem]">
        <div
          className={cn(
            COLS,
            "bg-surface-sunken px-3 py-1.5 font-semibold text-faint",
          )}
        >
          <span>Student</span>
          <span>Class</span>
          <span>Guardian</span>
        </div>
        {rows.map((row, i) => (
          <div
            key={row.name}
            className={cn(
              COLS,
              "border-t border-line px-3 py-1.5 transition-[opacity,transform] duration-500 ease-out",
              i < step
                ? "translate-y-0 opacity-100"
                : "-translate-y-1.5 opacity-0",
            )}
          >
            <span className="truncate font-medium">{row.name}</span>
            <span className="text-muted">{row.cls}</span>
            <span className="truncate text-muted">{row.guardian}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
