"use client";

import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/shared/FormField";
import type { Option } from "@/components/shared/OptionSelect";
import { fieldError } from "@/components/shared/form/field-error";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";

interface ExamChecklistFieldProps {
  name: string;
  label: string;
  options: Option[];
  loading?: boolean;
  emptyText: string;
}

/** Multi-select of exams as a checkbox list (value: string[]). */
export function ExamChecklistField({ name, label, options, loading, emptyText }: ExamChecklistFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = `${name}-list`;

  return (
    <FormField id={id} label={label} error={error} required>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selected: string[] = field.value ?? [];
          const toggle = (examId: string, checked: boolean) =>
            field.onChange(checked ? [...selected, examId] : selected.filter((item) => item !== examId));
          if (loading) return <p className="text-label text-fg-muted">Loading exams…</p>;
          if (options.length === 0) return <p className="text-label text-fg-muted">{emptyText}</p>;
          return (
            <div id={id} role="group" aria-label={label} className="flex flex-col gap-2 rounded-input border border-border p-3">
              {options.map((option) => {
                const optionId = `${id}-${option.id}`;
                return (
                  <div key={option.id} className="flex items-center gap-3">
                    <Checkbox
                      id={optionId}
                      checked={selected.includes(option.id)}
                      onCheckedChange={(checked) => toggle(option.id, checked === true)}
                    />
                    <Label htmlFor={optionId}>{option.name}</Label>
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </FormField>
  );
}
