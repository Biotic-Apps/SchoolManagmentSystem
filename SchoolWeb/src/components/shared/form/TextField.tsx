"use client";

import type { InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id"> {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
}

// Phone keypad / email keyboard and browser autofill follow the field type unless a caller overrides them.
const TYPE_DEFAULTS: Partial<Record<string, Pick<InputHTMLAttributes<HTMLInputElement>, "inputMode" | "autoComplete">>> = {
  email: { inputMode: "email", autoComplete: "email" },
  tel: { inputMode: "tel", autoComplete: "tel" },
  number: { inputMode: "numeric" },
};

export function TextField({ name, label, hint, required, className, inputClassName, ...inputProps }: TextFieldProps) {
  const { register, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Input
        id={id}
        className={inputClassName}
        aria-invalid={!!error}
        aria-describedby={error ? errorId(id) : undefined}
        {...(inputProps.type ? TYPE_DEFAULTS[inputProps.type] : undefined)}
        {...inputProps}
        {...register(name)}
      />
    </FormField>
  );
}
