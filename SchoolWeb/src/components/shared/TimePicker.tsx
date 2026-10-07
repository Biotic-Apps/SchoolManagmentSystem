"use client";

import { Clock } from "lucide-react";
import { PickerInput, type PickerInputBaseProps } from "./PickerInput";
import { TimePickerPanel } from "./time/TimePickerPanel";
import { useTimePicker } from "./time/use-time-picker";

export interface TimePickerProps extends PickerInputBaseProps {
  /** 24-hour "HH:mm"; shown as 12-hour. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Allows an empty value (Clear button, empty text). */
  clearable?: boolean;
}

/**
 * One time field: type "8:30 am" (or use the arrow keys: 5 minutes, Shift for an hour), or open
 * the clock to pick the hour, then the minutes. Enter confirms, Esc closes. The value stays "HH:mm".
 */
export function TimePicker({ value, onChange, clearable, placeholder = "e.g. 8:00 AM", ...field }: TimePickerProps) {
  const picker = useTimePicker({ value, onChange, clearable });
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
      icon={Clock}
      iconLabel="Open clock"
      panelLabel="Pick a time"
    >
      <TimePickerPanel
        parts={picker.parts}
        mode={picker.mode}
        onModeChange={picker.setMode}
        onChange={onChange}
        onDone={() => picker.setOpen(false)}
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
