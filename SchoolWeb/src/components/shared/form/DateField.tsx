"use client";

import { Controller, useFormContext } from "react-hook-form";
import { DatePicker } from "../DatePicker";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface DateFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Form date field with a calendar popover; the form value stays "YYYY-MM-DD" ("" when empty). */
export function DateField({ name, label, hint, required, disabled, className }: DateFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
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
