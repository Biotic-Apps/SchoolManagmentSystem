import type { ScheduleClash } from "./conflict-details";
import type { ExamPaper, SchedulePaperInput } from "./types";

export interface ScheduleRow {
  key: string;
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: string;
  passMarks: string;
  roomId: string;
}

let counter = 0;
const nextKey = () => `row-${(counter += 1)}`;

export function newRow(classId: string, previous?: ScheduleRow): ScheduleRow {
  return {
    key: nextKey(),
    classId,
    subjectId: "",
    date: previous?.date ?? "",
    startTime: previous?.startTime ?? "09:00",
    endTime: previous?.endTime ?? "11:00",
    maxMarks: previous?.maxMarks ?? "100",
    passMarks: previous?.passMarks ?? "33",
    roomId: "",
  };
}

export function rowsFromPapers(papers: ExamPaper[] | undefined): ScheduleRow[] {
  return (papers ?? []).map((paper) => ({
    key: paper.id ?? nextKey(),
    classId: paper.classId,
    subjectId: paper.subjectId,
    date: paper.date?.slice(0, 10) ?? "",
    startTime: paper.startTime ?? "",
    endTime: paper.endTime ?? "",
    maxMarks: String(paper.maxMarks ?? ""),
    passMarks: String(paper.passMarks ?? ""),
    roomId: paper.roomId ?? "",
  }));
}

/** Comparable form of the rows (ignores row keys). */
export function rowsSignature(rows: ScheduleRow[]): string {
  return JSON.stringify(
    rows.map((row) => [row.classId, row.subjectId, row.date, row.startTime, row.endTime, row.maxMarks, row.passMarks, row.roomId]),
  );
}

const WHOLE = /^\d+$/;

/** Client checks per row; empty when the row can be sent. */
export function rowProblems(row: ScheduleRow, rows: ScheduleRow[]): string[] {
  const problems: string[] = [];
  if (!row.subjectId) problems.push("Choose a subject");
  else if (rows.some((other) => other !== row && other.classId === row.classId && other.subjectId === row.subjectId)) {
    problems.push("Subject is listed twice for this class");
  }
  if (!row.date) problems.push("Pick a date");
  if (row.startTime && row.endTime && row.startTime >= row.endTime) problems.push("End time must be after the start");
  const max = WHOLE.test(row.maxMarks) ? Number(row.maxMarks) : null;
  const pass = WHOLE.test(row.passMarks) ? Number(row.passMarks) : null;
  if (!max) problems.push("Max marks must be a whole number above 0");
  if (pass === null) problems.push("Pass marks must be a whole number");
  else if (max && pass > max) problems.push("Pass marks can't be more than max marks");
  return problems;
}

export function toPaperInputs(rows: ScheduleRow[]): SchedulePaperInput[] {
  return rows.map((row) => ({
    classId: row.classId,
    subjectId: row.subjectId,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    maxMarks: Number(row.maxMarks),
    passMarks: Number(row.passMarks),
    roomId: row.roomId || undefined,
  }));
}

/** Rows a clash refers to: same class and subject, else same class or room on that date. */
export function rowsForClash(clash: ScheduleClash, rows: ScheduleRow[]): ScheduleRow[] {
  const sameDate = (row: ScheduleRow) => !clash.date || row.date === clash.date.slice(0, 10);
  if (clash.classId && clash.subjectId) {
    return rows.filter((row) => row.classId === clash.classId && row.subjectId === clash.subjectId);
  }
  if (clash.roomId) return rows.filter((row) => row.roomId === clash.roomId && sameDate(row));
  if (clash.classId) return rows.filter((row) => row.classId === clash.classId && sameDate(row));
  if (clash.subjectId) return rows.filter((row) => row.subjectId === clash.subjectId && sameDate(row));
  return [];
}
