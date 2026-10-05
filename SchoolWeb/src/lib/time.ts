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
