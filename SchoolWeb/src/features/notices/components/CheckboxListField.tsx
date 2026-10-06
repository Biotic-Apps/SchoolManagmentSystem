"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { CheckboxList } from "./CheckboxList";

interface CheckboxListFieldProps {
  name: string;
  label: string;
  options: Option[];
  loading?: boolean;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
}

/** CheckboxList bound to a string[] form field. */
export function CheckboxListField({ name, ...props }: CheckboxListFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <CheckboxList id={`field-${name}`} value={field.value ?? []} onChange={field.onChange} {...props} />
      )}
    />
  );
}
