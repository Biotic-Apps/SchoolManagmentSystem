"use client";

import { TimePicker } from "@/components/shared/TimePicker";

interface InlineTimeSelectProps {
  /** 24-hour "HH:mm" or null. */
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  disabled?: boolean;
}

/** Compact time field for table rows; empty clears the time. */
export function InlineTimeSelect({ value, onChange, label, disabled }: InlineTimeSelectProps) {
  return (
    <TimePicker
      value={value}
      onChange={onChange}
      ariaLabel={label}
      disabled={disabled}
      clearable
      placeholder="—"
      size="sm"
      className="w-32"
    />
  );
}
