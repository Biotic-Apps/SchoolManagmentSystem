"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { addDays, monthGrid, monthLabel, monthOf, shiftMonth, todayIso } from "@/lib/dates";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const KEY_DAYS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

interface CalendarPanelProps {
  value: string | null;
  onPick: (iso: string) => void;
  onClear?: () => void;
}

/** Month grid starting Monday; arrows move by day/week, PageUp/PageDown by month, Enter picks. */
export function CalendarPanel({ value, onPick, onClear }: CalendarPanelProps) {
  const [month, setMonth] = useState(() => monthOf(value));
  const [focusDate, setFocusDate] = useState(value ?? todayIso());
  const grid = useRef<HTMLDivElement>(null);
  const today = todayIso();

  const moveFocus = (iso: string) => {
    setFocusDate(iso);
    setMonth(monthOf(iso));
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)?.focus());
  };

  const onKeyDown = (event: KeyboardEvent, iso: string) => {
    const days = KEY_DAYS[event.key];
    if (days) {
      event.preventDefault();
      moveFocus(addDays(iso, days));
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const [y, m, d] = iso.split("-").map(Number);
      const target = shiftMonth({ year: y, month: m - 1 }, event.key === "PageUp" ? -1 : 1);
      const lastDay = new Date(target.year, target.month + 1, 0).getDate();
      moveFocus(`${target.year}-${String(target.month + 1).padStart(2, "0")}-${String(Math.min(d, lastDay)).padStart(2, "0")}`);
    }
  };

  const cells = monthGrid(month);
  const tabbable = cells.some((cell) => cell.date === focusDate) ? focusDate : cells.find((cell) => cell.inMonth)!.date;

  return (
    <div className="flex w-[280px] flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-8" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
          <ChevronLeft />
        </Button>
        <span className="text-label font-semibold text-fg" aria-live="polite">
          {monthLabel(month)}
        </span>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
          <ChevronRight />
        </Button>
      </div>
      <div ref={grid} role="grid" aria-label={monthLabel(month)} className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <span key={day} role="columnheader" className="grid h-7 place-items-center text-caption font-medium text-fg-muted">
            {day}
          </span>
        ))}
        {cells.map((cell) => {
          const selected = cell.date === value;
          return (
            <button
              key={cell.date}
              type="button"
              role="gridcell"
              data-date={cell.date}
              tabIndex={cell.date === tabbable ? 0 : -1}
              aria-selected={selected}
              aria-current={cell.date === today ? "date" : undefined}
              onClick={() => onPick(cell.date)}
              onKeyDown={(event) => onKeyDown(event, cell.date)}
              className={cn(
                "grid h-9 place-items-center rounded-input text-label tabular-nums transition-colors",
                selected
                  ? "bg-primary font-semibold text-on-primary"
                  : cell.inMonth
                    ? "text-fg hover:bg-selected"
                    : "text-fg-muted/60 hover:bg-selected/60",
                cell.date === today && !selected && "ring-1 ring-inset ring-primary/50",
                focusRing,
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        {onClear ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        ) : (
          <span />
        )}
        <Button variant="ghost" size="sm" onClick={() => onPick(today)}>
          Today
        </Button>
      </div>
    </div>
  );
}
