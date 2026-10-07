"use client";

import { Controller, useFormContext } from "react-hook-form";
import { TimePicker } from "../TimePicker";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface TimeFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Form time field: one input with a clock picker; the form value stays 24-hour "HH:mm". */
export function TimeField({ name, label, hint, required, disabled, className }: TimeFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TimePicker
            id={id}
            inputRef={field.ref}
            value={field.value || null}
            onChange={(value) => field.onChange(value ?? "")}
            onBlur={field.onBlur}
            disabled={disabled}
            invalid={!!error}
            describedBy={error ? errorId(id) : undefined}
            clearable={!required}
          />
        )}
      />
    </FormField>
  );
}
