import type { PersonRef } from "@/features/people/types";

/** Bell schedule row; times are 24-hour "HH:mm" in the API, shown 12-hour. */
export interface Period {
  index: number;
  /** "Period N": ordinal among the day's teaching periods; null on breaks (contract §5.4). */
  number?: number | null;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label?: string | null;
}

export type TimetableStatus = "DRAFT" | "PUBLISHED" | "DRAFT_REVISION";

/** What the user sees: nothing yet, a draft never published, published, or published with newer draft edits. */
export type TimetableState = "EMPTY" | "DRAFT" | "PUBLISHED" | "PUBLISHED_WITH_CHANGES";

export interface Ref {
  id: string;
  name: string;
}

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
  state?: TimetableState;
  /** null when the section has no timetable row yet. */
  status: TimetableStatus | null;
  /** Number of publishes; shown only when > 0. */
  version: number;
  publishedAt: string | null;
  draftUpdatedAt?: string | null;
  draftSlotCount?: number;
  publishedSlotCount?: number;
  /** Nothing blocks publishing right now (there are changes, no errors). */
  canPublish?: boolean;
  publishBlockedReason?: string | null;
  /** This user may edit this section's draft (teachers: only their class-teacher sections). */
  canEdit?: boolean;
  /** This user may publish/discard this section (principal, super admin). */
  canPublishRole?: boolean;
  slots: Slot[];
  /** Default bell schedule rows. */
  periods: Period[];
  /** Weekday-specific schedules keyed by ISO weekday ("5" = Friday). */
  dayPeriods?: Record<string, Period[]>;
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
  | "BREAK_PERIOD"
  | "PERIOD_NOT_ON_DAY"
  | "SUBJECT_NOT_IN_CLASS"
  | "TEACHER_DRAFT_CLASH"
  | "ROOM_DRAFT_CLASH"
  | "WEEKLY_PERIODS_EXCEEDED"
  | "WEEKLY_PERIODS_SHORT"
  | "TEACHER_DAY_LIMIT";

export type ConflictSeverity = "error" | "warning";

export interface Conflict {
  type: ConflictType;
  /** Missing on older APIs: treated as an error. */
  severity?: ConflictSeverity;
  day: number;
  periodIndex: number;
  message: string;
  otherSectionId?: string | null;
}

export interface TeacherSlot {
  date: string;
  day: number;
  periodIndex: number;
  /** "Period N" on that day (contract §5.5). */
  periodNumber?: number | null;
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
