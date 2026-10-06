"use client";

import type { ReactNode } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { cellKey, type GridDay, type GridRow } from "../grid";

interface WeekGridProps {
  caption: string;
  days: GridDay[];
  rows: GridRow[];
  renderCell: (day: number, row: GridRow) => ReactNode;
  /** Makes non-break cells clickable (editor). */
  onCellClick?: (day: number, row: GridRow) => void;
  /** Cell keys (`day-periodIndex`) to highlight, e.g. conflicts. */
  flagged?: Set<string>;
}

/** Days as columns, periods as rows; break rows are shaded and span the week. */
export function WeekGrid({ caption, days, rows, renderCell, onCellClick, flagged }: WeekGridProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-label">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-44 px-3 py-2 text-left text-caption font-medium text-fg-muted">
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
          {rows.map((row) => (
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
                days.map((day) => {
                  const isFlagged = flagged?.has(cellKey(day.day, row.periodIndex));
                  const content = renderCell(day.day, row);
                  return (
                    <td key={day.day} className="p-1 align-top">
                      {onCellClick ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(day.day, row)}
                          aria-label={`${day.title} ${row.title}, ${row.time}`}
                          className={cn(
                            "flex min-h-16 w-full flex-col items-start gap-0.5 rounded-input border border-dashed border-border px-2 py-1.5 text-left hover:bg-selected/60",
                            isFlagged && "border-solid border-error bg-error-soft",
                            focusRing,
                          )}
                        >
                          {content}
                        </button>
                      ) : (
                        <div
                          className={cn(
                            "flex min-h-16 flex-col gap-0.5 rounded-input px-2 py-1.5",
                            isFlagged && "border border-error bg-error-soft",
                          )}
                        >
                          {content}
                        </div>
                      )}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
