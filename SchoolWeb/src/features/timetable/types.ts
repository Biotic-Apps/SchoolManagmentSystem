import type { PersonRef } from "@/features/people/types";

/** Bell schedule row; times are 24-hour "HH:mm" in the API, shown 12-hour. */
export interface Period {
  index: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label?: string | null;
}

export type TimetableStatus = "DRAFT" | "PUBLISHED" | "DRAFT_REVISION";

export interface Slot {
  /** ISO weekday 1 = Monday … 7 = Sunday. */
  day: number;
  periodIndex: number;
  subject: PersonRef;
  staff: PersonRef;
  room: PersonRef | null;
}

export interface Timetable {
  sectionId: string;
  sessionId: string;
  status: TimetableStatus;
  version: number;
  publishedAt: string | null;
  slots: Slot[];
  periods: Period[];
}

export interface SlotInput {
  day: number;
  periodIndex: number;
  subjectId: string;
  staffId: string;
  roomId?: string;
}

export type ConflictType =
  | "TEACHER_DOUBLE_BOOKED"
  | "ROOM_DOUBLE_BOOKED"
  | "TEACHER_NOT_ASSIGNED"
  | "NON_WORKING_DAY"
  | "BREAK_PERIOD";

export interface Conflict {
  type: ConflictType;
  day: number;
  periodIndex: number;
  message: string;
  otherSectionId?: string | null;
}

export interface TeacherSlot {
  date: string;
  day: number;
  periodIndex: number;
  startTime: string;
  endTime: string;
  section: { id: string; name: string; className: string };
  subject: PersonRef;
  room: PersonRef | string | null;
  isSubstitute: boolean;
}

export interface TimetableOverride {
  id: string;
  sectionId: string;
  sectionName?: string | null;
  className?: string | null;
  date: string;
  periodIndex: number;
  substituteStaff?: PersonRef | null;
  substituteStaffId?: string;
  originalStaff?: PersonRef | null;
  reason: string | null;
}

export interface OverrideInput {
  sectionId: string;
  date: string;
  periodIndex: number;
  substituteStaffId: string;
  reason: string;
}
