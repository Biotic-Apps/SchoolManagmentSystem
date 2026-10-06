import type { ConflictType, TimetableStatus } from "./types";

/** ISO weekdays, 1 = Monday … 7 = Sunday. */
export const DAY_SHORT: Record<number, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun" };

export const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
export const SCHOOL_DAYS = [1, 2, 3, 4, 5];

export const dayShort = (day: number) => DAY_SHORT[day] ?? `Day ${day}`;
export const dayName = (day: number) => DAY_NAMES[day] ?? `Day ${day}`;

export const CONFLICT_LABELS: Record<ConflictType, string> = {
  TEACHER_DOUBLE_BOOKED: "Teacher double-booked",
  ROOM_DOUBLE_BOOKED: "Room double-booked",
  TEACHER_NOT_ASSIGNED: "Teacher not assigned",
  NON_WORKING_DAY: "Non-working day",
  BREAK_PERIOD: "Break period",
};

export const conflictLabel = (type: string) => CONFLICT_LABELS[type as ConflictType] ?? type;

export const STATUS_LABELS: Record<TimetableStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  DRAFT_REVISION: "Draft revision",
};

export type TimetableTabId = "section" | "bell" | "substitutions" | "teacher";
