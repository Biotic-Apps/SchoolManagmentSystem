"use client";

import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/shared/FormField";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fieldError } from "@/components/shared/form/field-error";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { PickupChoice } from "../pickup-choices";

interface PickerChoiceFieldProps {
  name: string;
  choices: PickupChoice[];
}

/** Radio list of who is collecting the student; unverified / revoked people are shown but disabled. */
export function PickerChoiceField({ name, choices }: PickerChoiceFieldProps) {
  const { control, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  return (
    <FormField id={`field-${name}`} label="Collected by" required error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div role="radiogroup" aria-label="Collected by" className="flex flex-col gap-2">
            {choices.map((choice) => {
              const checked = field.value === choice.value;
              return (
                <button
                  key={choice.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  disabled={!choice.selectable}
                  onClick={() => field.onChange(choice.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-input border px-3 py-2.5 text-left transition-colors",
                    checked ? "border-primary bg-selected" : "border-border bg-surface hover:bg-selected/60",
                    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-surface",
                    focusRing,
                  )}
                >
                  <PersonAvatar name={choice.name} photoUrl={choice.photoUrl} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-label font-medium text-fg">{choice.name}</span>
                    <span className="truncate text-caption text-fg-muted">{choice.caption}</span>
                  </span>
                  {choice.status !== "VERIFIED" && <StatusBadge status={choice.status} />}
                </button>
              );
            })}
          </div>
        )}
      />
    </FormField>
  );
}
