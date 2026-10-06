"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

interface CheckboxListProps {
  id: string;
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
}

/** Multi-select as a checkbox list in a bordered scroll box (audiences, participants). */
export function CheckboxList({
  id,
  label,
  options,
  value,
  onChange,
  loading,
  disabled,
  emptyText = "Nothing to choose from",
  className,
}: CheckboxListProps) {
  const selected = new Set(value);
  const toggle = (optionId: string, checked: boolean) =>
    onChange(checked ? [...value, optionId] : value.filter((item) => item !== optionId));

  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-1.5", className)} disabled={disabled}>
      <legend className="mb-1.5 flex w-full items-center justify-between gap-2 text-label font-medium text-fg">
        {label}
        {value.length > 0 && <span className="text-caption font-normal text-fg-muted">{value.length} selected</span>}
      </legend>
      <div className="max-h-48 overflow-y-auto rounded-input border border-border bg-surface p-1">
        {loading && <Skeleton className="m-2 h-5 w-3/4" />}
        {!loading && options.length === 0 && <p className="px-2 py-3 text-caption text-fg-muted">{emptyText}</p>}
        {!loading &&
          options.map((option) => {
            const optionId = `${id}-${option.id}`;
            return (
              <div key={option.id} className="flex items-center gap-3 rounded-input px-2 py-2 hover:bg-selected/60">
                <Checkbox
                  id={optionId}
                  checked={selected.has(option.id)}
                  onCheckedChange={(checked) => toggle(option.id, checked === true)}
                  disabled={disabled}
                />
                <Label htmlFor={optionId} className="min-w-0 flex-1 cursor-pointer truncate font-normal">
                  {option.name}
                </Label>
              </div>
            );
          })}
      </div>
    </fieldset>
  );
}
