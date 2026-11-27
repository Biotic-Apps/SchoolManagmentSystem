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
    const students = Array.isArray(raw.students)
      ? raw.students.filter((s): s is string => typeof s === "string")
      : [];
    const label = parts.join(" · ") || text(raw.message) || `Sheet ${index + 1}`;
    return {
      key: String(raw.sheetId ?? raw.id ?? index),
      label: students.length > 0 ? `${label}: marks missing for ${students.join(", ")}` : label,
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

const CLASH_TEXT: Record<string, string> = {
  CLASS: "The class has another paper at this time",
  ROOM: "The room is already booked at this time",
};

/**
 * Schedule clashes; strings become general messages not tied to a row.
 * The API sends `{ kind, date, first, second }` (both papers of the clash).
 */
export function scheduleClashes(items: unknown[]): ScheduleClash[] {
  const id = (value: unknown) => (typeof value === "string" ? value : undefined);
  return items.flatMap((item): ScheduleClash[] => {
    if (typeof item === "string") return [{ message: item }];
    const raw = (item ?? {}) as Raw;
    if (raw.first && typeof raw.first === "object") {
      const message = CLASH_TEXT[String(raw.kind)] ?? "Clashes with another paper";
      return [raw.first, raw.second]
        .filter((paper): paper is Raw => !!paper && typeof paper === "object")
        .map((paper) => ({
          classId: id(paper.classId),
          subjectId: id(paper.subjectId),
          date: id(paper.date) ?? id(raw.date),
          message,
        }));
    }
    return [{
      classId: id(raw.classId),
      subjectId: id(raw.subjectId),
      roomId: id(raw.roomId),
      date: id(raw.date),
      message: text(raw.message) ?? text(raw.reason) ?? "Clashes with another paper",
    }];
  });
}

const PAPER_PROBLEM_TEXT: Record<string, string> = {
  DUPLICATE_PAPER: "Subject is listed twice for this class",
  CLASS_NOT_IN_EXAM: "The class is not part of this exam",
  SUBJECT_NOT_IN_CLASS: "The subject is not taught in this class",
  END_BEFORE_START: "End time must be after the start",
  PASS_ABOVE_MAX: "Pass marks can't be more than max marks",
  OUTSIDE_SESSION: "The date is outside the academic session",
  ROOM_NOT_IN_BRANCH: "The room is not in this branch",
  NON_WORKING_DAY: "Not a working day for this branch",
  HOLIDAY: "The date is a holiday",
  VACATION: "The date is in a vacation",
  OUTSIDE_SCHOOL_HOURS: "Times must be within school hours",
};

export interface PaperProblem {
  index: number;
  message: string;
}

/** 400 `details.problems` of a schedule save: `{ index, problem, message? }` per paper. */
export function paperProblems(error: unknown): PaperProblem[] {
  if (!(error instanceof ApiError) || error.status !== 400) return [];
  const details = (error.details ?? {}) as Raw;
  const list = Array.isArray(details.problems) ? details.problems : [];
  return list.flatMap((item): PaperProblem[] => {
    const raw = (item ?? {}) as Raw;
    if (typeof raw.index !== "number") return [];
    const message = text(raw.message) ?? PAPER_PROBLEM_TEXT[String(raw.problem)] ?? String(raw.problem ?? "Invalid paper");
    return [{ index: raw.index, message }];
  });
}
