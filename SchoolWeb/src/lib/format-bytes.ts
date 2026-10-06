import { EMPTY_VALUE } from "./format";

const UNITS = ["B", "KB", "MB", "GB", "TB"];

/** Human-readable file size, e.g. "12.4 MB". */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return EMPTY_VALUE;
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${UNITS[unit]}`;
}
