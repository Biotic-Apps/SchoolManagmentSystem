"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPeriod, shiftPeriod } from "@/lib/period";

interface PeriodStepperProps {
  /** "YYYY-MM" */
  value: string;
  onChange: (period: string) => void;
  /** Latest selectable month, e.g. the current one. */
  max?: string;
}

/** Previous / next month for billing and payroll periods. */
export function PeriodStepper({ value, onChange, max }: PeriodStepperProps) {
  const next = shiftPeriod(value, 1);
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" className="size-11" aria-label="Previous month" onClick={() => onChange(shiftPeriod(value, -1))}>
        <ChevronLeft />
      </Button>
      <span className="min-w-36 text-center text-body font-medium text-fg" aria-live="polite">
        {formatPeriod(value)}
      </span>
      <Button
        variant="secondary"
        size="icon"
        className="size-11"
        aria-label="Next month"
        disabled={!!max && next > max}
        onClick={() => onChange(next)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
