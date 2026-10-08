"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fieldBase } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

interface NumberStepperProps {
  /** Accessible name, e.g. "English periods per week". */
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Allows clearing the number (shown as "—"). */
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** − [n] + for small whole numbers; type a number too. Arrow keys step by one. */
export function NumberStepper({ label, value, onChange, min = 0, max = 99, allowEmpty, disabled, className }: NumberStepperProps) {
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? (value == null ? "" : String(value));

  const step = (delta: number) => onChange(clamp((value ?? min) + delta, min, max));
  const commit = () => {
    if (text === null) return;
    setText(null);
    const trimmed = text.trim();
    if (!trimmed) return allowEmpty ? onChange(null) : undefined;
    const parsed = Number(trimmed);
    if (Number.isInteger(parsed)) onChange(clamp(parsed, min, max));
  };

  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="size-8 px-0"
        onClick={() => step(-1)}
        disabled={disabled || (value ?? min) <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus />
      </Button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={shown}
        placeholder="—"
        disabled={disabled}
        onChange={(event) => setText(event.target.value.replace(/[^\d]/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            step(event.key === "ArrowUp" ? 1 : -1);
          }
        }}
        className={cn(fieldBase, "h-8 w-11 px-1 text-center text-label tabular-nums")}
      />
      <Button
        variant="ghost"
        size="sm"
        className="size-8 px-0"
        onClick={() => step(1)}
        disabled={disabled || (value ?? min) >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus />
      </Button>
    </div>
  );
}
