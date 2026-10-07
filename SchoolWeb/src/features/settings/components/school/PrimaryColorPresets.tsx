"use client";

import { Check } from "lucide-react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { PRIMARY_COLOR_PRESETS } from "../../primary-color-presets";

interface PrimaryColorPresetsProps {
  value: string;
  onPick: (hex: string) => void;
}

export function PrimaryColorPresets({ value, onPick }: PrimaryColorPresetsProps) {
  const current = value.trim().toUpperCase();
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Suggested colours">
      {PRIMARY_COLOR_PRESETS.map((preset) => {
        const selected = current === preset.hex;
        return (
          <button
            key={preset.hex}
            type="button"
            title={preset.name}
            aria-label={preset.name}
            aria-pressed={selected}
            onClick={() => onPick(preset.hex)}
            style={{ backgroundColor: preset.hex }}
            className={cn("grid size-8 place-items-center rounded-full text-white", focusRing, selected && "ring-2 ring-fg/30 ring-offset-2")}
          >
            {selected && <Check className="size-4" />}
          </button>
        );
      })}
    </div>
  );
}
