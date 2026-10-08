export type ConflictType =
  | 'TEACHER_DOUBLE_BOOKED'
  | 'ROOM_DOUBLE_BOOKED'
  | 'TEACHER_NOT_ASSIGNED'
  | 'NON_WORKING_DAY'
  | 'BREAK_PERIOD'
  | 'PERIOD_NOT_ON_DAY'
  | 'SUBJECT_NOT_IN_CLASS'
  | 'TEACHER_DRAFT_CLASH'
  | 'ROOM_DRAFT_CLASH'
  | 'WEEKLY_PERIODS_EXCEEDED'
  | 'WEEKLY_PERIODS_SHORT'
  | 'TEACHER_DAY_LIMIT';

export type ConflictSeverity = 'error' | 'warning';

/** Errors block publishing; warnings don't (contract §5.5). */
export const SEVERITY: Record<ConflictType, ConflictSeverity> = {
  TEACHER_DOUBLE_BOOKED: 'error',
  ROOM_DOUBLE_BOOKED: 'error',
  TEACHER_NOT_ASSIGNED: 'error',
  NON_WORKING_DAY: 'error',
  BREAK_PERIOD: 'error',
  PERIOD_NOT_ON_DAY: 'error',
  SUBJECT_NOT_IN_CLASS: 'error',
  TEACHER_DRAFT_CLASH: 'warning',
  ROOM_DRAFT_CLASH: 'warning',
  WEEKLY_PERIODS_EXCEEDED: 'warning',
  WEEKLY_PERIODS_SHORT: 'warning',
  TEACHER_DAY_LIMIT: 'warning',
};

export interface Conflict {
  type: ConflictType;
  severity: ConflictSeverity;
  day: number;
  periodIndex: number;
  message: string;
  otherSectionId?: string;
}

export interface PlannedSlot {
  day: number;
  periodIndex: number;
  subjectId: string;
  staffId: string;
  roomId: string | null;
}

export interface BusySlot extends PlannedSlot {
  sectionId: string;
  /** "Class 8 B", used in messages when known. */
  sectionName?: string;
}

/** One subject of the section's curriculum. */
export interface CurriculumEntry {
  name: string;
  periodsPerWeek: number | null;
}

export interface ConflictInput {
  slots: PlannedSlot[];
  workingDays: ReadonlySet<number>;
  /** index → isBreak of the schedule a weekday uses. */
  periodsOn: (day: number) => ReadonlyMap<number, boolean>;
  /** Published slots of other sections in the same session. */
  others: BusySlot[];
  /** Draft slots of other sections whose draft differs from published. */
  otherDrafts?: BusySlot[];
  /** `staffId:subjectId` of subject teachers, `staffId:*` of class teachers. */
  teaching: ReadonlySet<string>;
  /** Subjects of the class for this section's group; omitted = not checked. */
  curriculum?: ReadonlyMap<string, CurriculumEntry>;
  /** Teacher periods per day across sections before TEACHER_DAY_LIMIT. */
  maxPeriodsPerDay?: number;
}

export const isError = (c: Conflict) => c.severity === 'error';
