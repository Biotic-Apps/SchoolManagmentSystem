import { ApiError } from "@/lib/api-error";

type Raw = Record<string, unknown>;

function asList(details: unknown): unknown[] {
  if (Array.isArray(details)) return details;
  if (details && typeof details === "object") {
    const nested = Object.values(details as Raw).find(Array.isArray);
    if (nested) return nested as unknown[];
  }
  return [];
}

function text(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object" && typeof (value as Raw).name === "string") return (value as Raw).name as string;
  return undefined;
}

/** 409 detail items when the error is a conflict, otherwise null. */
export function conflictItems(error: unknown): unknown[] | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  return asList(error.details);
}

export interface UnacceptedSheet {
  key: string;
  label: string;
  status?: string;
}

/** Sheets blocking result approval; tolerant of strings or { className, sectionName, subject, status }. */
export function unacceptedSheets(items: unknown[]): UnacceptedSheet[] {
  return items.map((item, index) => {
    if (typeof item === "string") return { key: `${index}`, label: item };
    const raw = (item ?? {}) as Raw;
    const paper = (raw.paper ?? {}) as Raw;
    const parts = [
      text(raw.className) ?? text(paper.className),
      text(raw.sectionName) ?? text(raw.section),
      text(raw.subjectName) ?? text(raw.subject) ?? text(paper.subject),
    ].filter(Boolean);
    return {
      key: String(raw.sheetId ?? raw.id ?? index),
      label: parts.join(" · ") || text(raw.message) || `Sheet ${index + 1}`,
      status: typeof raw.status === "string" ? raw.status : undefined,
    };
  });
}

export interface ScheduleClash {
  classId?: string;
  subjectId?: string;
  roomId?: string;
  date?: string;
  message: string;
}

/** Schedule clashes; strings become general messages not tied to a row. */
export function scheduleClashes(items: unknown[]): ScheduleClash[] {
  return items.map((item) => {
    if (typeof item === "string") return { message: item };
    const raw = (item ?? {}) as Raw;
    const id = (value: unknown) => (typeof value === "string" ? value : undefined);
    return {
      classId: id(raw.classId),
      subjectId: id(raw.subjectId),
      roomId: id(raw.roomId),
      date: id(raw.date),
      message: text(raw.message) ?? text(raw.reason) ?? "Clashes with another paper",
    };
  });
}
