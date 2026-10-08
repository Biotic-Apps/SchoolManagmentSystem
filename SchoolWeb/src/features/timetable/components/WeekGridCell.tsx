"use client";

import type { ReactNode } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { GridDay, GridRow } from "../grid";
import type { CellInfo } from "../grid-frame";
import type { CellMark } from "../conflict-marks";

interface WeekGridCellProps {
  day: GridDay;
  row: GridRow;
  /** [row, column] for arrow-key moves. */
  position: [number, number];
  info: CellInfo;
  mark?: CellMark;
  onClick?: (day: number, row: GridRow) => void;
  children: ReactNode;
}

const BOX = "flex min-h-16 w-full flex-col items-start gap-0.5 rounded-input px-2 py-1.5 text-left";

/** One day × period cell: a lesson (clickable in the editor), that day's break, or "—" when the day has no such period. */
export function WeekGridCell({ day, row, position, info, mark, onClick, children }: WeekGridCellProps) {
  if (info.kind === "none") {
    return (
      <div className={cn(BOX, "items-center justify-center text-fg-muted")} title={`No ${row.title} on ${day.title}`}>
        —
      </div>
    );
  }
  if (info.kind === "break") {
    return (
      <div className={cn(BOX, "bg-background text-caption text-fg-muted")}>
        {info.label}
        {info.time && <span>{info.time}</span>}
      </div>
    );
  }
  const markClass = mark && (mark.severity === "error" ? "border-solid border-error bg-error-soft" : "border-solid border-warning bg-warning-soft");
  const content = (
    <>
      {info.time && <span className="text-caption text-fg-muted">{info.time}</span>}
      {children}
    </>
  );
  if (!onClick) {
    return (
      <div className={cn(BOX, mark && "border", markClass)} title={mark?.message}>
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      data-cell
      data-row={position[0]}
      data-col={position[1]}
      onClick={() => onClick(day.day, row)}
      aria-label={`${day.title} ${row.title}${info.time ? `, ${info.time}` : `, ${row.time}`}${mark ? `. ${mark.message}` : ""}`}
      title={mark?.message}
      className={cn(BOX, "border border-dashed border-border hover:bg-selected/60", markClass, focusRing)}
    >
      {content}
    </button>
  );
}
