"use client";

import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "../FormField";
import { WeekdayPicker } from "../WeekdayPicker";
import { fieldError, fieldId } from "./field-error";

export function WeekdaysField({ name, label, required }: { name: string; label: string; required?: boolean }) {
  const { control, formState } = useFormContext();
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} error={fieldError(formState.errors, name)} required={required}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <WeekdayPicker id={id} value={field.value ?? []} onChange={field.onChange} />}
      />
    </FormField>
  );
}
