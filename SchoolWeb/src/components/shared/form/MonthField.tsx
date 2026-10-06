"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface MonthFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Month picker; the form value is "YYYY-MM" (billing / payroll period). */
export function MonthField({ name, label, hint, required, disabled, className }: MonthFieldProps) {
  const { register, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Input
        id={id}
        type="month"
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId(id) : undefined}
        {...register(name)}
      />
    </FormField>
  );
}
