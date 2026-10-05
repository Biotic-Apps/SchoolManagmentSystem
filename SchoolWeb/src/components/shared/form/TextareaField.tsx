"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/Textarea";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface TextareaFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function TextareaField({ name, label, hint, required, rows = 3, placeholder, className }: TextareaFieldProps) {
  const { register, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId(id) : undefined}
        {...register(name)}
      />
    </FormField>
  );
}
