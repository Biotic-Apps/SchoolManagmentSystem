"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { fromTimeParts, pad, toTimeParts, type Meridiem, type TimeParts } from "@/lib/time";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const MERIDIEMS: Meridiem[] = ["AM", "PM"];
const FALLBACK: TimeParts = { hour: 9, minute: 0, meridiem: "AM" };

interface TimeSelect12Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

/** Inline 12-hour picker outside a form; the value stays 24-hour "HH:mm". */
export function TimeSelect12({ value, onChange, label, disabled }: TimeSelect12Props) {
  const parts = toTimeParts(value) ?? FALLBACK;
  const update = (patch: Partial<TimeParts>) => onChange(fromTimeParts({ ...parts, ...patch }));
  const minutes = MINUTES.includes(parts.minute) ? MINUTES : [...MINUTES, parts.minute].sort((a, b) => a - b);

  return (
    <div className="grid min-w-52 grid-cols-[1fr_1fr_auto] gap-1.5" role="group" aria-label={label}>
      <Select value={String(parts.hour)} onValueChange={(v) => update({ hour: Number(v) })} disabled={disabled}>
        <SelectTrigger aria-label={`${label} hour`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((hour) => (
            <SelectItem key={hour} value={String(hour)}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(parts.minute)} onValueChange={(v) => update({ minute: Number(v) })} disabled={disabled}>
        <SelectTrigger aria-label={`${label} minute`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((minute) => (
            <SelectItem key={minute} value={String(minute)}>
              {pad(minute)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={parts.meridiem} onValueChange={(v) => update({ meridiem: v as Meridiem })} disabled={disabled}>
        <SelectTrigger aria-label={`${label} AM or PM`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MERIDIEMS.map((meridiem) => (
            <SelectItem key={meridiem} value={meridiem}>
              {meridiem}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
