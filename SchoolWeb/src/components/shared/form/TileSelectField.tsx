"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { errorId } from "../FormField";
import { TileSelectGroup, type TileGroup } from "../TileSelectGroup";
import { fieldError, fieldId } from "./field-error";

interface TileSelectFieldProps {
  name: string;
  label: string;
  groups: TileGroup[];
  hint?: string;
  className?: string;
}

const linkClass = cn("rounded-sm text-label font-medium text-primary hover:underline disabled:text-fg-muted disabled:no-underline", focusRing);

/** string[] form value picked from tiles, with "Select all / Clear" and a live count. */
export function TileSelectField({ name, label, groups, hint, className }: TileSelectFieldProps) {
  const { control, formState } = useFormContext();
  const id = fieldId(name);
  const error = fieldError(formState.errors, name);
  const all = groups.flatMap((group) => group.options);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value: string[] = field.value ?? [];
        return (
          <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <Label htmlFor={id}>
                {label} <span className="font-normal text-fg-muted">· {value.length} selected</span>
              </Label>
              <div className="flex items-center gap-3">
                <button type="button" className={linkClass} disabled={value.length === all.length} onClick={() => field.onChange(all)}>
                  Select all
                </button>
                <button type="button" className={linkClass} disabled={value.length === 0} onClick={() => field.onChange([])}>
                  Clear
                </button>
              </div>
            </div>
            <TileSelectGroup id={id} label={label} groups={groups} value={value} onChange={field.onChange} />
            {error?.message ? (
              <p id={errorId(id)} role="alert" className="animate-fade-in text-caption text-error">
                {error.message}
              </p>
            ) : (
              hint && <p className="text-caption text-fg-muted">{hint}</p>
            )}
          </div>
        );
      }}
    />
  );
}
