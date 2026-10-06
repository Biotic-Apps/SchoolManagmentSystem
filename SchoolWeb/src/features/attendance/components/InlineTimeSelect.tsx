"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { fromTimeParts, pad, toTimeParts, type Meridiem, type TimeParts } from "@/lib/time";

const NONE = "none";
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const TRIGGER = "h-9 px-2 text-label";

interface InlineTimeSelectProps {
  /** 24-hour "HH:mm" or null. */
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  disabled?: boolean;
}

// School hours: 7–11 read as morning, 12 and 1–6 as afternoon when first picked.
function guessMeridiem(hour: number): Meridiem {
  return hour >= 7 && hour <= 11 ? "AM" : "PM";
}

/** Compact 12-hour time control for table rows; "—" clears the time. */
export function InlineTimeSelect({ value, onChange, label, disabled }: InlineTimeSelectProps) {
  const parts = toTimeParts(value);
  const update = (patch: Partial<TimeParts>) => {
    const base: TimeParts = parts ?? { hour: patch.hour ?? 8, minute: 0, meridiem: guessMeridiem(patch.hour ?? 8) };
    onChange(fromTimeParts({ ...base, ...patch }));
  };
  const minutes = parts && !MINUTES.includes(parts.minute) ? [...MINUTES, parts.minute].sort((a, b) => a - b) : MINUTES;

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      <Select
        value={parts ? String(parts.hour) : NONE}
        onValueChange={(v) => (v === NONE ? onChange(null) : update({ hour: Number(v) }))}
        disabled={disabled}
      >
        <SelectTrigger aria-label={`${label} hour`} className={`${TRIGGER} w-16`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>—</SelectItem>
          {HOURS.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {parts && (
        <>
          <Select value={String(parts.minute)} onValueChange={(v) => update({ minute: Number(v) })} disabled={disabled}>
            <SelectTrigger aria-label={`${label} minute`} className={`${TRIGGER} w-16`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {pad(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={parts.meridiem} onValueChange={(v) => update({ meridiem: v as Meridiem })} disabled={disabled}>
            <SelectTrigger aria-label={`${label} AM or PM`} className={`${TRIGGER} w-18`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}
