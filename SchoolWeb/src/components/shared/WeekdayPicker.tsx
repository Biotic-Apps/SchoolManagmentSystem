"use client";

import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui/styles";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

interface WeekdayPickerProps {
  value: number[];
  onChange: (days: number[]) => void;
  id?: string;
  disabled?: boolean;
}

/** ISO weekdays, 1 = Monday … 7 = Sunday. */
export function WeekdayPicker({ value, onChange, id, disabled }: WeekdayPickerProps) {
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b));

  return (
    <div id={id} role="group" className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const selected = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => toggle(day.value)}
            className={cn(
              "h-9 min-w-12 rounded-input border px-3 text-label font-medium transition-colors disabled:opacity-60",
              selected ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-fg hover:bg-selected/60",
              focusRing,
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}

export function weekdayLabels(days: number[]): string {
  return DAYS.filter((day) => days.includes(day.value))
    .map((day) => day.label)
    .join(", ");
}
