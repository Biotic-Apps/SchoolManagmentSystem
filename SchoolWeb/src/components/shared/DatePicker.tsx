"use client";

import { CalendarDays } from "lucide-react";
import { CalendarPanel } from "./date/CalendarPanel";
import { useDatePicker } from "./date/use-date-picker";
import { PickerInput, type PickerInputBaseProps } from "./PickerInput";

export interface DatePickerProps extends PickerInputBaseProps {
  /** "YYYY-MM-DD"; shown as "1 Apr 2026". */
  value: string | null;
  onChange: (value: string | null) => void;
  clearable?: boolean;
}

/** One date field: type "1 Apr 2026" or "1/4/2026", or pick from the calendar. The value stays ISO. */
export function DatePicker({ value, onChange, clearable, placeholder = "e.g. 1 Apr 2026", ...field }: DatePickerProps) {
  const picker = useDatePicker({ value, onChange, clearable });
  return (
    <PickerInput
      {...field}
      placeholder={placeholder}
      text={picker.text}
      onTextChange={picker.type}
      onKeyDown={picker.onKeyDown}
      onCommit={picker.commit}
      open={picker.open}
      onOpenChange={picker.setOpen}
      icon={CalendarDays}
      iconLabel="Open calendar"
      panelLabel="Pick a date"
    >
      <CalendarPanel
        value={value}
        onPick={(iso) => {
          onChange(iso);
          picker.setOpen(false);
        }}
        onClear={
          clearable
            ? () => {
                onChange(null);
                picker.setOpen(false);
              }
            : undefined
        }
      />
    </PickerInput>
  );
}
