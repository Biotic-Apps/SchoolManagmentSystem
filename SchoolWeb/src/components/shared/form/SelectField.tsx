"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import type { Option } from "../OptionSelect";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

const NONE = "__none";

interface SelectFieldProps {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  /** Adds a first item that clears the value (stored as ""). */
  emptyLabel?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  name,
  label,
  options,
  placeholder = "Select",
  emptyLabel,
  hint,
  required,
  disabled,
  className,
}: SelectFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value ? String(field.value) : emptyLabel ? NONE : ""}
            onValueChange={(value) => field.onChange(value === NONE ? "" : value)}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-invalid={!!error}
              aria-describedby={error ? errorId(id) : undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {emptyLabel && <SelectItem value={NONE}>{emptyLabel}</SelectItem>}
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}
