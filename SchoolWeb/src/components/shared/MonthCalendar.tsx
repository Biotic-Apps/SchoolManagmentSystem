"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { isWithin, monthGrid, monthLabel, shiftMonth, toIsoDate, type MonthRef } from "@/lib/dates";
import type { BadgeTone } from "@/components/ui/Badge";

export interface CalendarItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  tone: BadgeTone;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-background text-fg-muted",
  primary: "bg-selected text-on-selected",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  info: "bg-info-soft text-info",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_PER_DAY = 3;

interface MonthCalendarProps {
  month: MonthRef;
  onMonthChange: (month: MonthRef) => void;
  items: CalendarItem[];
  onItemClick?: (id: string) => void;
}

export function MonthCalendar({ month, onMonthChange, items, onItemClick }: MonthCalendarProps) {
  const today = toIsoDate(new Date());
  const cells = monthGrid(month).map((cell) => ({
    ...cell,
    items: items.filter((item) => isWithin(cell.date, item.startDate, item.endDate)),
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body font-semibold text-fg">{monthLabel(month)}</h3>
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" aria-label="Previous month" onClick={() => onMonthChange(shiftMonth(month, -1))}>
            <ChevronLeft />
          </Button>
          <Button variant="secondary" size="sm" aria-label="Next month" onClick={() => onMonthChange(shiftMonth(month, 1))}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-card border border-border bg-surface">
        {WEEKDAYS.map((day) => (
          <div key={day} className="border-b border-border px-2 py-2 text-center text-caption font-medium text-fg-muted">
            {day}
          </div>
        ))}
        {cells.map((cell) => (
          <div
            key={cell.date}
            className={cn(
              "flex min-h-24 flex-col gap-1 border-b border-r border-border p-1.5 [&:nth-child(7n)]:border-r-0",
              !cell.inMonth && "bg-background/60",
            )}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-caption",
                cell.date === today ? "bg-primary text-on-primary" : cell.inMonth ? "text-fg" : "text-fg-muted/60",
              )}
            >
              {cell.day}
            </span>
            {cell.items.slice(0, MAX_PER_DAY).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemClick?.(item.id)}
                title={item.title}
                className={cn("truncate rounded px-1.5 py-0.5 text-left text-caption", TONE_CLASS[item.tone])}
              >
                {item.title}
              </button>
            ))}
            {cell.items.length > MAX_PER_DAY && (
              <span className="px-1.5 text-caption text-fg-muted">+{cell.items.length - MAX_PER_DAY} more</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
