import { EMPTY_VALUE } from "@/lib/format";

/** "2m 14s" between two ISO times; dash while unfinished. */
export function formatDuration(startIso: string | null | undefined, endIso: string | null | undefined): string {
  if (!startIso || !endIso) return EMPTY_VALUE;
  const seconds = Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000));
  if (!Number.isFinite(seconds)) return EMPTY_VALUE;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${rest}s`;
  return `${rest}s`;
}

export function isNumeric(value: unknown): boolean {
  return typeof value === "number" || (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)));
}
