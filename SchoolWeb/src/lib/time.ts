import { EMPTY_VALUE } from "./format";

// Times are stored and sent as 24-hour "HH:mm"; the UI always shows 12-hour with AM/PM.

export type Meridiem = "AM" | "PM";

export interface TimeParts {
  hour: number; // 1–12
  minute: number; // 0–59
  meridiem: Meridiem;
}

const PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function toTimeParts(value: string | null | undefined): TimeParts | null {
  const match = value ? PATTERN.exec(value) : null;
  if (!match) return null;
  const hour24 = Number(match[1]);
  return {
    hour: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute: Number(match[2]),
    meridiem: hour24 < 12 ? "AM" : "PM",
  };
}

export function fromTimeParts({ hour, minute, meridiem }: TimeParts): string {
  const hour24 = (hour % 12) + (meridiem === "PM" ? 12 : 0);
  return `${pad(hour24)}:${pad(minute)}`;
}

export function formatTime(value: string | null | undefined): string {
  const parts = toTimeParts(value);
  return parts ? `${parts.hour}:${pad(parts.minute)} ${parts.meridiem}` : EMPTY_VALUE;
}

export function formatTimeRange(from: string | null | undefined, to: string | null | undefined): string {
  return from && to ? `${formatTime(from)} – ${formatTime(to)}` : EMPTY_VALUE;
}

export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

const TYPED = /^(\d{1,2})(?:[:.\s]?(\d{2}))?\s*([ap])?\.?\s*m?\.?$/;

// School hours: a bare 7–11 reads as morning; 12 and 1–6 as afternoon.
function guessHour24(hour: number): number {
  if (hour === 12) return 12;
  return hour >= 7 ? hour : hour + 12;
}

/** Reads typed times like "8:30 am", "830p", "14:05" or "8"; returns "HH:mm" or null. */
export function parseTimeText(text: string): string | null {
  const match = TYPED.exec(text.trim().toLowerCase());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  if (minute > 59) return null;
  if (match[3]) {
    if (hour < 1 || hour > 12) return null;
    return fromTimeParts({ hour, minute, meridiem: match[3] === "a" ? "AM" : "PM" });
  }
  if (hour > 23) return null;
  // "14", "0" or "08" are already 24-hour; a bare "8" is guessed from school hours.
  const explicit24 = hour > 12 || hour === 0 || /^0\d$/.test(match[1]);
  const hour24 = explicit24 ? hour : guessHour24(hour);
  return `${pad(hour24)}:${pad(minute)}`;
}

/** Moves "HH:mm" by whole minutes, wrapping around midnight. */
export function shiftTime(value: string | null | undefined, minutes: number, fallback = "08:00"): string {
  const parts = /^(\d{2}):(\d{2})$/.exec(value ?? "") ?? /^(\d{2}):(\d{2})$/.exec(fallback)!;
  const total = (((Number(parts[1]) * 60 + Number(parts[2]) + minutes) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}
