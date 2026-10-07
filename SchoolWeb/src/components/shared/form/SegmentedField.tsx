"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { Option } from "../OptionSelect";
import { FormField } from "../FormField";
import { SegmentedControl } from "../SegmentedControl";
import { fieldError, fieldId } from "./field-error";

interface SegmentedFieldProps {
  name: string;
  label: string;
  options: Option[];
  /** Live helper text for the current value. */
  hint?: (value: string) => string;
  className?: string;
}

export function SegmentedField({ name, label, options, hint, className }: SegmentedFieldProps) {
  const { control, formState } = useFormContext();
  const id = fieldId(name);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormField id={id} label={label} error={fieldError(formState.errors, name)} hint={hint?.(field.value)} className={className}>
          <SegmentedControl id={id} label={label} options={options} value={field.value} onChange={field.onChange} className="self-start" />
        </FormField>
      )}
    />
  );
}
