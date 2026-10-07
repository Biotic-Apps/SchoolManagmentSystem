"use client";

import { TimePicker } from "@/components/shared/TimePicker";

interface TimeSelect12Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

/** Time field for schedule rows (outside a form); shows 12-hour, the value stays "HH:mm". */
export function TimeSelect12({ value, onChange, label, disabled }: TimeSelect12Props) {
  return (
    <TimePicker
      value={value || null}
      onChange={(next) => next && onChange(next)}
      ariaLabel={label}
      disabled={disabled}
      size="sm"
      className="w-36"
    />
  );
}
