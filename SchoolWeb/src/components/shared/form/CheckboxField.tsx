"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { fieldId } from "./field-error";

interface CheckboxFieldProps {
  name: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export function CheckboxField({ name, label, hint, disabled }: CheckboxFieldProps) {
  const { control } = useFormContext();
  const id = fieldId(name);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-start gap-3">
          <Checkbox
            id={id}
            ref={field.ref}
            checked={!!field.value}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={id}>{label}</Label>
            {hint && <span className="text-caption text-fg-muted">{hint}</span>}
          </div>
        </div>
      )}
    />
  );
}
