"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { fieldError } from "@/components/shared/form/field-error";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";

interface ClassChecklistFieldProps {
  name: string;
  options: Option[];
  loading?: boolean;
}

/** Multi-select of classes as a checkbox grid; the value is an id array. */
export function ClassChecklistField({ name, options, loading }: ClassChecklistFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name)?.message;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = field.value ?? [];
        const toggle = (id: string, checked: boolean) =>
          field.onChange(checked ? [...selected, id] : selected.filter((value) => value !== id));
        return (
          <div className="flex flex-col gap-2">
            {loading && <p className="text-caption text-fg-muted">Loading classes…</p>}
            {!loading && options.length === 0 && <p className="text-caption text-fg-muted">No classes set up yet.</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {options.map((option) => {
                const id = `class-${option.id}`;
                return (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={selected.includes(option.id)}
                      onCheckedChange={(checked) => toggle(option.id, checked === true)}
                    />
                    <Label htmlFor={id}>{option.name}</Label>
                  </div>
                );
              })}
            </div>
            {error && (
              <p role="alert" className="text-caption text-error">
                {error}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
