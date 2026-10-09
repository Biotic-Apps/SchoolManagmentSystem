"use client";

import { fieldBase } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { SkillScaleLevel } from "../../skill-types";

interface SkillRatingSelectProps {
  value: number | null;
  scale: SkillScaleLevel[];
  onChange: (value: number | null) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

/** Compact native select (many per screen): level codes only; the legend and tooltip give the labels. */
export function SkillRatingSelect({ value, scale, onChange, label, disabled, className }: SkillRatingSelectProps) {
  return (
    <select
      aria-label={label}
      title={scale.find((level) => level.value === value)?.label ?? "Not rated"}
      disabled={disabled}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
      className={cn(fieldBase, "h-8 w-14 px-1.5 text-center text-label tabular-nums", value === null && "text-fg-muted", className)}
    >
      <option value="">–</option>
      {scale.map((level) => (
        <option key={level.value} value={level.value} title={level.label}>
          {level.code}
        </option>
      ))}
    </select>
  );
}
