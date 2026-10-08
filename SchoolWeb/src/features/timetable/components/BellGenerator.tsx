"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { NumberStepper } from "@/components/shared/NumberStepper";
import { TimePicker } from "@/components/shared/TimePicker";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { DEFAULT_BELL, type BellSettings } from "../bell-generator";

interface BellGeneratorProps {
  /** Short name of the schedule being filled, e.g. "Friday". */
  dayName: string;
  initial?: Partial<BellSettings>;
  onGenerate: (settings: BellSettings) => void;
}

const NUMBER_FIELDS: { key: Exclude<keyof BellSettings, "startTime">; label: string; min: number; max: number }[] = [
  { key: "periodMinutes", label: "Period length (min)", min: 10, max: 120 },
  { key: "periodsPerDay", label: "Periods per day", min: 1, max: 12 },
  { key: "breakAfter", label: "Break after period", min: 0, max: 11 },
  { key: "breakMinutes", label: "Break length (min)", min: 0, max: 90 },
];

/** "Generate…": start time, length, count and break fill the rows in one go. */
export function BellGenerator({ dayName, initial, onGenerate }: BellGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<BellSettings>({ ...DEFAULT_BELL, ...initial });

  if (!open)
    return (
      <Button variant="secondary" className="self-start" onClick={() => setOpen(true)}>
        <Wand2 />
        Generate…
      </Button>
    );

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4">
      <p className="text-label text-fg-muted">Fill {dayName} with evenly spaced periods. You can adjust any row afterwards.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bell-start">First period starts</Label>
          <TimePicker id="bell-start" value={settings.startTime} onChange={(value) => value && setSettings({ ...settings, startTime: value })} />
        </div>
        {NUMBER_FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-fg">{field.label}</span>
            <NumberStepper
              label={field.label}
              value={settings[field.key]}
              onChange={(value) => setSettings({ ...settings, [field.key]: value ?? field.min })}
              min={field.min}
              max={field.max}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            onGenerate(settings);
            setOpen(false);
          }}
        >
          Fill the rows
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
