"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { LEVEL_PRESETS, type ClassLevel } from "../../level-presets";

interface PresetMenuProps {
  onApply: (level: ClassLevel) => void;
  loading?: boolean;
}

/** "Apply preset ▾": adds a level's usual subjects with their periods per week. */
export function PresetMenu({ onApply, loading }: PresetMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" loading={loading}>
          <Sparkles />
          Apply preset
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Adds the missing subjects only</DropdownMenuLabel>
        {LEVEL_PRESETS.map((preset) => (
          <DropdownMenuItem key={preset.key} onSelect={() => onApply(preset.key)}>
            {preset.label}
            <span className="ml-auto pl-4 text-caption text-fg-muted">{preset.subjects.length} subjects</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
