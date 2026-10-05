"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import type { ChildSummary } from "@/features/auth/types";
import { cn } from "@/lib/cn";

interface ChildSwitcherProps {
  items: ChildSummary[];
  value: string | null;
  onChange: (childId: string) => void;
  className?: string;
}

export function ChildSwitcher({ items, value, onChange, className }: ChildSwitcherProps) {
  if (items.length === 0) return null;
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger aria-label="Select child" className={cn("h-10 w-56", className)}>
        <SelectValue placeholder="Select child" />
      </SelectTrigger>
      <SelectContent>
        {items.map((child) => (
          <SelectItem key={child.id} value={child.id}>
            {child.className ? `${child.name} · ${child.className}` : child.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
