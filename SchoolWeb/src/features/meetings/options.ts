import type { Option } from "@/components/shared/OptionSelect";
import { addDays, todayIso } from "@/lib/dates";
import type { MeetingMode } from "./types";

export const MODE_OPTIONS: Option[] = [
  { id: "IN_PERSON", name: "In person" },
  { id: "PHONE", name: "Phone" },
  { id: "VIDEO", name: "Video call" },
];

export function modeLabel(mode: MeetingMode | string): string {
  return MODE_OPTIONS.find((option) => option.id === mode)?.name ?? mode;
}

/** Parents can book up to two weeks ahead. */
export const BOOKING_DAYS = 14;

export function bookingWindow() {
  const from = todayIso();
  return { from, to: addDays(from, BOOKING_DAYS - 1) };
}

/** Monday of the week containing the date (school-local). */
export function weekStart(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const offset = (new Date(year, month - 1, day).getDay() + 6) % 7;
  return addDays(iso, -offset);
}

export function weekdayLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PK", { weekday: "long", day: "numeric", month: "short" }).format(
    new Date(year, month - 1, day),
  );
}

/** Groups items by their `date`, in date order. */
export function groupByDate<T extends { date: string; startTime: string }>(items: T[]): { date: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of [...items].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))) {
    groups.set(item.date, [...(groups.get(item.date) ?? []), item]);
  }
  return [...groups].map(([date, grouped]) => ({ date, items: grouped }));
}
