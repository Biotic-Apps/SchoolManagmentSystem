"use client";

import { useRef, type KeyboardEvent } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { Option } from "./OptionSelect";

interface SegmentedControlProps {
  id?: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/** One-of-a-few picker shown as joined buttons (radio group); arrow keys move the choice. */
export function SegmentedControl({ id, label, options, value, onChange, disabled, className }: SegmentedControlProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex h-10 rounded-input border border-border-strong bg-surface p-0.5", className)}
    >
      {options.map((option, index) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "min-w-11 flex-1 rounded-[6px] px-3 text-label font-medium tabular-nums transition-colors disabled:opacity-60",
              selected ? "bg-primary text-on-primary" : "text-fg-muted hover:bg-selected hover:text-fg",
              focusRing,
            )}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
