"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface MoneyFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  currency?: string;
  className?: string;
}

/** Rupee amount typed as text (validate with lib/money moneyText, send toMinor()). */
export function MoneyField({ name, label, hint, required, disabled, currency = "PKR", className }: MoneyFieldProps) {
  const { register, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-label text-fg-muted">{currency}</span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          className={cn("pl-12 text-right tabular-nums")}
          aria-invalid={!!error}
          aria-describedby={error ? errorId(id) : undefined}
          {...register(name)}
        />
      </div>
    </FormField>
  );
}
