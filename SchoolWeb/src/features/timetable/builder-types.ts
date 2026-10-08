import type { Conflict, Period, Ref, Slot, Timetable, TimetableState } from "./types";

/** One subject of the section with its weekly target and allocated teacher. */
export interface BuilderLesson {
  subject: Ref;
  periodsPerWeek: number | null;
  placed: number;
  teacher: Ref | null;
}

/** Another section's lesson at that time: the teacher or room is taken. */
export interface BusyEntry {
  staffId?: string;
  roomId?: string;
  day: number;
  periodIndex: number;
  sectionName: string;
  published: boolean;
}

/** GET /timetables/:sectionId/builder */
export interface TimetableBuilder {
  timetable: Timetable;
  section: { id: string; name: string; group: string | null; class: Ref; branchId: string };
  lessons: BuilderLesson[];
  rooms: Ref[];
  busy: BusyEntry[];
  conflicts: Conflict[];
  maxPeriodsPerDay: number;
  /** Per-section rights (user decision 2026-10-08); missing on older APIs → fall back to permissions. */
  canEdit?: boolean;
  canPublish?: boolean;
}

export interface CellInput {
  subjectId: string;
  staffId: string;
  roomId: string | null;
  /** Make the teacher this subject's teacher of the section when nobody is. */
  allocate: boolean;
}

/** PUT/DELETE /timetables/:sectionId/slots/:day/:periodIndex */
export interface CellResult {
  slot?: Slot;
  conflicts: Conflict[];
  lesson: { subjectId: string; placed: number; periodsPerWeek: number | null } | null;
  state: TimetableState;
  canPublish: boolean;
  publishBlockedReason: string | null;
}

export interface PeriodInput {
  index: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label?: string;
}

/** GET /branches/:id/bell-schedule */
export interface BellSchedule {
  workingDays: number[];
  default: Period[];
  days: Record<string, Period[]>;
}

export interface BellScheduleInput {
  default: PeriodInput[];
  days: Record<string, PeriodInput[]>;
  dropLessons?: boolean;
}
