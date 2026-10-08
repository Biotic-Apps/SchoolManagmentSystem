import { EMPTY_VALUE } from "../format";
import { fieldLabel, formatAuditValue, formatCompactRange, isHiddenField } from "./values";

// Pure summaries of lists of records (e.g. a branch's periods) for the audit timeline.

type Row = Record<string, unknown>;

export function isRecordList(value: unknown): value is Row[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => item !== null && typeof item === "object" && !Array.isArray(item));
}

function isSchedule(rows: Row[]): boolean {
  return rows.every((row) => typeof row.startTime === "string" && typeof row.endTime === "string");
}

function byStart(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function scheduleSummary(rows: Row[]): string {
  const sorted = byStart(rows);
  const breaks = sorted.filter((row) => row.isBreak === true);
  const lessons = sorted.length - breaks.length;
  const span = formatCompactRange(String(sorted[0].startTime), String(sorted[sorted.length - 1].endTime));
  const parts = [plural(lessons, "period"), span];
  if (breaks.length) {
    const ranges = breaks.map((row) => formatCompactRange(String(row.startTime), String(row.endTime)));
    parts.push(`${breaks.length === 1 ? "break" : "breaks"} ${ranges.join(", ")}`);
  }
  return parts.join(", ");
}

function scheduleRows(rows: Row[]): string[] {
  let lesson = 0;
  return byStart(rows).map((row) => {
    const time = formatCompactRange(String(row.startTime), String(row.endTime));
    const label = typeof row.label === "string" && row.label.trim() ? row.label : null;
    if (row.isBreak === true) return [label ?? "Break", time].join(" · ");
    lesson += 1;
    return [`Period ${lesson}`, label, time].filter(Boolean).join(" · ");
  });
}

const NAME_KEYS = ["name", "label", "title", "subjectName", "className"];

/** One record as "Name · Field: value · …", skipping ids and empty values. */
export function describeRecord(row: Row): string {
  const nameKey = NAME_KEYS.find((key) => typeof row[key] === "string" && String(row[key]).trim());
  const rest = Object.entries(row)
    .filter(([key, value]) => key !== nameKey && !isHiddenField(key) && (value === null || typeof value !== "object"))
    .map(([key, value]) => [key, formatAuditValue(key, value)] as const)
    .filter(([, text]) => text !== EMPTY_VALUE)
    .map(([key, text]) => `${fieldLabel(key)}: ${text}`);
  return [nameKey ? String(row[nameKey]) : null, ...rest].filter(Boolean).join(" · ") || "Item";
}

/** "6 periods, 8:00 AM–12:40 PM, break 10:00–10:40 AM" or "3 items". */
export function summariseList(value: unknown, noun = "item"): string {
  if (!Array.isArray(value) || value.length === 0) return "None";
  if (!isRecordList(value)) return formatAuditValue("", value);
  return isSchedule(value) ? scheduleSummary(value) : plural(value.length, noun);
}

/** Readable rows for the "Show details" expander. */
export function listRows(value: unknown): string[] {
  if (!isRecordList(value)) return [];
  return isSchedule(value) ? scheduleRows(value) : value.map(describeRecord);
}

/** Singular noun for a list field: "periods" → "period", "assignments" → "assignment". */
export function nounFor(key: string): string {
  const words = fieldLabel(key).toLowerCase();
  return words.endsWith("ies") ? `${words.slice(0, -3)}y` : words.replace(/s$/, "");
}
