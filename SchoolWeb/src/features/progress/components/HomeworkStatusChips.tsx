"use client";

import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { HOMEWORK_STATUS_CHOICES } from "../options";
import type { HomeworkStatus } from "../types";

const SELECTED: Record<HomeworkStatus, string> = {
  DONE: "border-success bg-success text-on-primary",
  PARTIAL: "border-warning bg-warning text-on-primary",
  NOT_DONE: "border-error bg-error text-on-primary",
};

interface HomeworkStatusChipsProps {
  value: HomeworkStatus | null;
  onChange: (status: HomeworkStatus) => void;
  disabled?: boolean;
  /** Student name, for screen readers. */
  label: string;
}

/** Segmented Done / Partial / Not done for one student. */
export function HomeworkStatusChips({ value, onChange, disabled, label }: HomeworkStatusChipsProps) {
  return (
    <div role="radiogroup" aria-label={`Homework for ${label}`} className="flex gap-1">
      {HOMEWORK_STATUS_CHOICES.map((choice) => {
        const selected = value === choice.id;
        return (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(choice.id)}
            className={cn(
              "h-9 rounded-input border px-3 text-label font-medium transition-colors disabled:cursor-not-allowed",
              focusRing,
              selected ? SELECTED[choice.id] : "border-border bg-surface text-fg-muted hover:bg-selected/60",
              disabled && !selected && "opacity-50",
            )}
          >
            {choice.name}
          </button>
        );
      })}
    </div>
  );
}
