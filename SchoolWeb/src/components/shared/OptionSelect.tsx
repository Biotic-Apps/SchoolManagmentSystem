"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export interface Option {
  id: string;
  name: string;
}

interface OptionSelectProps {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OptionSelect({ label, options, value, onChange, disabled, className }: OptionSelectProps) {
  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={disabled || options.length === 0}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
