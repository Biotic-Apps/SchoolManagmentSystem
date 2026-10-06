import { formatDate, formatDateTime } from "@/lib/format";
import { formatTime, pad } from "@/lib/time";

function isToday(date: Date): boolean {
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

/** Thread list stamp: 12-hour time today, otherwise the date. */
export function shortStamp(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return isToday(date) ? formatTime(`${pad(date.getHours())}:${pad(date.getMinutes())}`) : formatDate(iso);
}

/** Message stamp: 12-hour time today, otherwise date and time. */
export function messageStamp(iso: string): string {
  return isToday(new Date(iso)) ? shortStamp(iso) : formatDateTime(iso);
}

export function classLabel(className: string | null | undefined, sectionName: string | null | undefined): string {
  return [className, sectionName].filter(Boolean).join(" – ");
}
