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
        {...inputProps}
        {...register(name)}
      />
    </FormField>
  );
}
