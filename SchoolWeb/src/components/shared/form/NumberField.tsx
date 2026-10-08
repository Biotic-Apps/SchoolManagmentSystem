"use client";

import { Controller, useFormContext } from "react-hook-form";
import { NumberStepper } from "../NumberStepper";
import { FormField } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface NumberFieldProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  hint?: string;
  className?: string;
}

/** Small whole number with − / + buttons; the form value is a number. */
export function NumberField({ name, label, min = 0, max = 99, hint, className }: NumberFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  return (
    <FormField id={fieldId(name)} label={label} error={error} hint={hint} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <NumberStepper label={label} value={field.value ?? null} onChange={(value) => field.onChange(value ?? min)} min={min} max={max} />
        )}
      />
    </FormField>
  );
}
