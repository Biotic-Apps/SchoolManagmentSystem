"use client";

import { CreatableSelect } from "@/components/shared/CreatableSelect";
import type { HintedOption } from "@/components/shared/select-option";
import { useOptimisticSave } from "@/lib/use-optimistic-save";
import { cn } from "@/lib/cn";

interface TeacherSelectProps {
  label: string;
  options: HintedOption[];
  value: string | null;
  onSave: (staffId: string | null) => Promise<unknown>;
  emptyLabel: string;
  /** Read-only: shows the name as text. */
  readOnly?: boolean;
  readOnlyText?: string;
  /** Highlights an empty choice (e.g. a subject still without a teacher). */
  flagEmpty?: boolean;
  className?: string;
}

/** Teacher picker that saves as soon as a teacher is chosen. */
export function TeacherSelect({ label, options, value, onSave, emptyLabel, readOnly, readOnlyText, flagEmpty, className }: TeacherSelectProps) {
  const choice = useOptimisticSave<string | null>(value, onSave);
  if (readOnly) {
    return <span className={cn("text-label", readOnlyText ? "text-fg" : "text-fg-muted", className)}>{readOnlyText ?? "—"}</span>;
  }
  return (
    <CreatableSelect
      label={label}
      options={options}
      value={choice.value}
      onChange={(next) => void choice.set(next)}
      emptyLabel={emptyLabel}
      className={cn(flagEmpty && !choice.value && "border-warning bg-warning-soft", className)}
    />
  );
}
