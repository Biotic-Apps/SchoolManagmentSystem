"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { cellKey, type GridDay, type GridRow } from "../grid";
import type { CellInfo } from "../grid-frame";
import type { CellMark } from "../conflict-marks";
import { WeekGridCell } from "./WeekGridCell";

interface WeekGridProps {
  caption: string;
  days: GridDay[];
  rows: GridRow[];
  renderCell: (day: number, row: GridRow) => ReactNode;
  /** Makes lesson cells clickable (editor). */
  onCellClick?: (day: number, row: GridRow) => void;
  /** Per-day cell kind and time (day-specific schedules); every cell is a lesson cell without it. */
  info?: (day: number, periodIndex: number) => CellInfo;
  /** Conflicts per cell key (`day-periodIndex`). */
  marks?: Map<string, CellMark>;
}

// Arrow keys move between the editor's cell buttons.
function moveFocus(event: KeyboardEvent<HTMLTableElement>) {
  const delta = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[event.key];
  const current = (event.target as HTMLElement).closest<HTMLElement>("[data-cell]");
  if (!delta || !current) return;
  const row = Number(current.dataset.row) + delta[0];
  const col = Number(current.dataset.col) + delta[1];
  const next = event.currentTarget.querySelector<HTMLElement>(`[data-cell][data-row="${row}"][data-col="${col}"]`);
  if (next) {
    event.preventDefault();
    next.focus();
  }
}

/** Days as columns, periods as rows ("Period 1 · 8:00 – 8:40 AM"); break rows are shaded and span the week. */
export function WeekGrid({ caption, days, rows, renderCell, onCellClick, info, marks }: WeekGridProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
      <table className="w-full min-w-[720px] table-fixed border-collapse text-label" onKeyDown={onCellClick ? moveFocus : undefined}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-40 px-3 py-2 text-left text-caption font-medium text-fg-muted">
              Period
            </th>
            {days.map((day) => (
              <th key={day.day} scope="col" className="px-3 py-2 text-left font-medium text-fg">
                {day.title}
                {day.caption && <span className="block text-caption font-normal text-fg-muted">{day.caption}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.periodIndex} className={cn("border-b border-border last:border-b-0", row.isBreak && "bg-background")}>
              <th scope="row" className="px-3 py-2 text-left align-top font-medium text-fg">
                {row.title}
                <span className="block whitespace-nowrap text-caption font-normal text-fg-muted">{row.time}</span>
              </th>
              {row.isBreak ? (
                <td colSpan={days.length} className="px-3 py-2 text-center text-caption text-fg-muted">
                  {row.title}
                </td>
              ) : (
                days.map((day, colIndex) => (
                  <td key={day.day} className="p-1 align-top">
                    <WeekGridCell
                      day={day}
                      row={row}
                      position={[rowIndex, colIndex]}
                      info={info?.(day.day, row.periodIndex) ?? { kind: "lesson" }}
                      mark={marks?.get(cellKey(day.day, row.periodIndex))}
                      onClick={onCellClick}
                    >
                      {renderCell(day.day, row)}
                    </WeekGridCell>
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
