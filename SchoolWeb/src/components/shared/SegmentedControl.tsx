"use client";

import { useRef, type KeyboardEvent } from "react";
import { focusRing } from "@/components/ui/styles";
import { useTabIndicator } from "@/components/ui/use-tab-indicator";
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

const PILL_OPTIONS = { selector: '[role="radio"][aria-checked="true"]', attributes: ["aria-checked"] };

/** One-of-a-few picker shown as joined buttons (radio group); arrow keys move the choice. */
export function SegmentedControl({ id, label, options, value, onChange, disabled, className }: SegmentedControlProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const { listRef: pillRef, style: pillStyle, animated: pillAnimated } = useTabIndicator<HTMLDivElement>(PILL_OPTIONS);

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
      ref={pillRef}
      id={id}
      role="radiogroup"
      aria-label={label}
      className={cn("relative inline-flex h-10 rounded-input border border-border-strong bg-surface p-0.5", className)}
    >
      {pillStyle && (
        <span
          aria-hidden
          style={pillStyle}
          className={cn(
            "pointer-events-none absolute left-0 top-0 rounded-lg bg-primary will-change-transform",
            disabled && "opacity-60",
            pillAnimated && "transition-[transform,width,height] duration-(--dur-standard) ease-standard motion-reduce:transition-none",
          )}
        />
      )}
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
              "relative z-[1] min-w-11 flex-auto whitespace-nowrap rounded-lg px-3 text-label font-medium tabular-nums transition-colors duration-(--dur-quick) disabled:opacity-60",
              selected
                ? cn("text-on-primary", !pillStyle && "bg-primary")
                : "text-fg-muted hover:bg-selected hover:text-fg",
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
