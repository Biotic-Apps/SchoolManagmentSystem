"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { Option } from "../OptionSelect";
import type { HintedOption } from "../select-option";
import { CreatableSelect } from "../CreatableSelect";
import { FormField } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface CreatableSelectFieldProps {
  name: string;
  label: string;
  options: HintedOption[];
  placeholder?: string;
  emptyLabel?: string;
  createLabel?: string;
  onCreate?: (name: string) => Promise<Option>;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Form select whose list items can carry hints ("2 left") and which can add a new entry in place. */
export function CreatableSelectField({ name, label, hint, required, className, ...select }: CreatableSelectFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CreatableSelect
            id={id}
            label={label}
            value={field.value || null}
            onChange={(value) => field.onChange(value ?? "")}
            invalid={!!error}
            className="h-11"
            {...select}
          />
        )}
      />
    </FormField>
  );
}
