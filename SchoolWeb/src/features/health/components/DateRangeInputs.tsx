"use client";

import { Input } from "@/components/ui/Input";

interface DateRangeInputsProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeInputs({ from, to, onFromChange, onToChange }: DateRangeInputsProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        aria-label="From date"
        value={from}
        max={to}
        onChange={(event) => event.target.value && onFromChange(event.target.value)}
        className="w-44"
      />
      <span className="text-label text-fg-muted">to</span>
      <Input
        type="date"
        aria-label="To date"
        value={to}
        min={from}
        onChange={(event) => event.target.value && onToChange(event.target.value)}
        className="w-44"
      />
    </div>
  );
}
