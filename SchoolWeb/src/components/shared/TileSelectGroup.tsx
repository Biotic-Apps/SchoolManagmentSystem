"use client";

import { Check } from "lucide-react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

export interface TileGroup {
  label?: string;
  options: string[];
}

interface TileSelectGroupProps {
  id?: string;
  label: string;
  groups: TileGroup[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

/** Compact tickable tiles for picking several items, optionally in labelled groups. Keeps option order. */
export function TileSelectGroup({ id, label, groups, value, onChange, disabled }: TileSelectGroupProps) {
  const all = groups.flatMap((group) => group.options);
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : all.filter((o) => o === option || value.includes(o)));

  return (
    <div id={id} role="group" aria-label={label} className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.label ?? "all"} className="flex flex-col gap-2">
          {group.label && <span className="text-caption font-medium text-fg-muted">{group.label}</span>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {group.options.map((option) => {
              const selected = value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => toggle(option)}
                  className={cn(
                    "flex h-9 min-w-0 items-center gap-2 rounded-input border px-2.5 text-left text-label transition-colors disabled:opacity-60",
                    selected
                      ? "border-primary bg-surface text-fg"
                      : "border-border bg-background text-fg-muted hover:border-border-strong",
                    focusRing,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-[4px] border",
                      selected ? "border-primary bg-primary text-on-primary" : "border-border-strong bg-surface",
                    )}
                  >
                    {selected && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="truncate">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
