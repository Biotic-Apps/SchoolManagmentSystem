"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { monthLabel, shiftMonth, type MonthRef } from "@/lib/dates";

interface MonthStepperProps {
  value: MonthRef;
  onChange: (month: MonthRef) => void;
  /** Disables "next" on the current month. */
  atLatest?: boolean;
}

export function MonthStepper({ value, onChange, atLatest }: MonthStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" className="size-11" aria-label="Previous month" onClick={() => onChange(shiftMonth(value, -1))}>
        <ChevronLeft />
      </Button>
      <span className="min-w-36 text-center text-body font-medium text-fg" aria-live="polite">
        {monthLabel(value)}
      </span>
      <Button
        variant="secondary"
        size="icon"
        className="size-11"
        aria-label="Next month"
        disabled={atLatest}
        onClick={() => onChange(shiftMonth(value, 1))}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
