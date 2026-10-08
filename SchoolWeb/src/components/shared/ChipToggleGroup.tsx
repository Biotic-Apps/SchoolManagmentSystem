"use client";

import { Plus } from "lucide-react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

interface ChipToggleGroupProps {
  /** Accessible name, e.g. "Sections of Class 9". */
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Shows a "+" chip that adds the next option (e.g. the next section letter). */
  onAddMore?: () => void;
  addLabel?: string;
  /** Keeps at least this many chips on. */
  min?: number;
  disabled?: boolean;
  className?: string;
}

/** Small on/off chips (A B C D +) for picking a few short items in order. */
export function ChipToggleGroup({
  label,
  options,
  value,
  onChange,
  onAddMore,
  addLabel = "Add one more",
  min = 0,
  disabled,
  className,
}: ChipToggleGroupProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      if (value.length > min) onChange(value.filter((item) => item !== option));
      return;
    }
    onChange(options.filter((item) => item === option || value.includes(item)));
  };

  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => toggle(option)}
            className={cn(
              "h-8 min-w-8 rounded-full border px-2.5 text-label font-medium transition-colors disabled:opacity-60",
              on ? "border-primary bg-primary text-on-primary" : "border-border-strong bg-surface text-fg-muted hover:bg-selected",
              focusRing,
            )}
          >
            {option}
          </button>
        );
      })}
      {onAddMore && (
        <button
          type="button"
          onClick={onAddMore}
          disabled={disabled}
          aria-label={addLabel}
          title={addLabel}
          className={cn(
            "grid size-8 place-items-center rounded-full border border-dashed border-border-strong text-fg-muted hover:bg-selected disabled:opacity-60",
            focusRing,
          )}
        >
          <Plus className="size-4" />
        </button>
      )}
    </div>
  );
}
