"use client";

import { cn } from "@/lib/cn";
import { STATUS_CHOICES, type StatusChoice } from "../options";
import type { AttendanceStatus } from "../types";

const SELECTED: Record<StatusChoice["tone"], string> = {
  success: "border-success bg-success text-on-primary",
  error: "border-error bg-error text-on-primary",
  warning: "border-warning bg-warning text-on-primary",
  info: "border-info bg-info text-on-primary",
  primary: "border-primary bg-primary text-on-primary",
  neutral: "border-border bg-selected text-fg",
};

interface StatusChipsProps {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  /** Student name, for screen readers. */
  label: string;
}

/** One-tap attendance marking: P / A / L / Lv / ½. */
export function StatusChips({ value, onChange, disabled, label }: StatusChipsProps) {
  return (
    <div role="radiogroup" aria-label={`Attendance for ${label}`} className="flex gap-1">
      {STATUS_CHOICES.map((choice) => {
        const selected = value === choice.id;
        return (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={choice.label}
            title={choice.label}
            disabled={disabled}
            onClick={() => onChange(choice.id)}
            className={cn(
              "grid h-9 min-w-9 place-items-center rounded-input border px-2 text-label font-semibold transition-colors",
              "outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed",
              selected ? SELECTED[choice.tone] : "border-border bg-surface text-fg-muted hover:bg-selected/60",
              disabled && !selected && "opacity-50",
            )}
          >
            {choice.short}
          </button>
        );
      })}
    </div>
  );
}
