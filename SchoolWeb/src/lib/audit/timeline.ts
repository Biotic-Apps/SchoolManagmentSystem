import { formatAuditDate } from "./values";

// Day grouping for the audit timeline (newest first).

export interface DayGroup<T> {
  key: string;
  label: string;
  entries: T[];
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** "Today", "Yesterday" or "6 Oct 2026" for a timestamp, relative to `now`. */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return "Today";
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday";
  return formatAuditDate(iso);
}

/** Sorts newest first and groups by local calendar day. */
export function groupByDay<T extends { at: string }>(entries: T[], now: Date = new Date()): DayGroup<T>[] {
  const sorted = [...entries].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const groups: DayGroup<T>[] = [];
  for (const entry of sorted) {
    const key = dayKey(new Date(entry.at));
    const last = groups[groups.length - 1];
    if (last?.key === key) last.entries.push(entry);
    else groups.push({ key, label: dayLabel(entry.at, now), entries: [entry] });
  }
  return groups;
}
