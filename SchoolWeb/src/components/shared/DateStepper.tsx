"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { addDays, todayIso } from "@/lib/dates";

interface DateStepperProps {
  value: string;
  onChange: (value: string) => void;
  /** Latest selectable date, e.g. today for registers. */
  max?: string;
  label?: string;
  className?: string;
}

/** Day picker with previous / next day buttons and a jump back to today. */
export function DateStepper({ value, onChange, max, label = "Date", className }: DateStepperProps) {
  const today = todayIso();
  const next = addDays(value, 1);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="secondary" size="icon" className="size-11" aria-label="Previous day" onClick={() => onChange(addDays(value, -1))}>
        <ChevronLeft />
      </Button>
      <Input
        type="date"
        aria-label={label}
        value={value}
        max={max}
        onChange={(event) => event.target.value && onChange(event.target.value)}
        className="w-44"
      />
      <Button
        variant="secondary"
        size="icon"
        className="size-11"
        aria-label="Next day"
        disabled={!!max && next > max}
        onClick={() => onChange(next)}
      >
        <ChevronRight />
      </Button>
      {value !== today && (
        <Button variant="ghost" onClick={() => onChange(today)}>
          Today
        </Button>
      )}
    </div>
  );
}
