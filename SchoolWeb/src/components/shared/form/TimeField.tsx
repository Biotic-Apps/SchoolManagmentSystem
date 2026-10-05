"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { fromTimeParts, pad, toTimeParts, type Meridiem, type TimeParts } from "@/lib/time";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const MERIDIEMS: Meridiem[] = ["AM", "PM"];
const FALLBACK: TimeParts = { hour: 8, minute: 0, meridiem: "AM" };

interface TimeFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** 12-hour time picker (hour, minute, AM/PM); the form value stays 24-hour "HH:mm". */
export function TimeField({ name, label, hint, required, disabled, className }: TimeFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const parts = toTimeParts(field.value) ?? FALLBACK;
          const update = (patch: Partial<TimeParts>) => field.onChange(fromTimeParts({ ...parts, ...patch }));
          const describedBy = error ? errorId(id) : undefined;
          return (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2" role="group" aria-label={label}>
              <Select value={String(parts.hour)} onValueChange={(v) => update({ hour: Number(v) })} disabled={disabled}>
                <SelectTrigger id={id} ref={field.ref} onBlur={field.onBlur} aria-label="Hour" aria-invalid={!!error} aria-describedby={describedBy}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={String(h)}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(parts.minute)} onValueChange={(v) => update({ minute: Number(v) })} disabled={disabled}>
                <SelectTrigger aria-label="Minute" aria-invalid={!!error}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {withCurrent(MINUTES, parts.minute).map((m) => (
                    <SelectItem key={m} value={String(m)}>{pad(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={parts.meridiem} onValueChange={(v) => update({ meridiem: v as Meridiem })} disabled={disabled}>
                <SelectTrigger aria-label="AM or PM" aria-invalid={!!error}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MERIDIEMS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }}
      />
    </FormField>
  );
}

// Keeps a saved off-step minute (e.g. 07) selectable.
function withCurrent(options: number[], current: number): number[] {
  return options.includes(current) ? options : [...options, current].sort((a, b) => a - b);
}
