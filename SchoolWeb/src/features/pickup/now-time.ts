import { pad } from "@/lib/time";

/** Current local time as 24-hour "HH:mm" (form default for TimeField). */
export function nowTime(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
