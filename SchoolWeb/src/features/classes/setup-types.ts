import type { Ref, TimetableState } from "@/features/timetable/types";

export type ClassIssue = "NO_SECTIONS" | "NO_SUBJECTS" | "NO_CLASS_TEACHER" | "SUBJECTS_WITHOUT_TEACHER" | "NO_TIMETABLE";

export interface OverviewSection {
  id: string;
  name: string;
  group: string | null;
  studentCount: number;
  capacity: number | null;
  room: Ref | null;
  classTeacher: Ref | null;
  timetable: TimetableState;
}

export interface OverviewSubject {
  id: string;
  name: string;
  periodsPerWeek: number | null;
  group: string | null;
}

/** GET /classes/overview: one card per class. */
export interface ClassOverview {
  id: string;
  name: string;
  levelOrder: number;
  status: string;
  studentCount: number;
  capacity: number | null;
  sections: OverviewSection[];
  subjects: OverviewSubject[];
  issues: ClassIssue[];
  /** Section × subject pairs without a teacher. */
  unallocated: number;
}

export interface ClassSubjectItem {
  subjectId: string;
  code: string;
  name: string;
  periodsPerWeek: number | null;
  isOptional: boolean;
  group: string | null;
  sortOrder: number;
}

export interface AllocationRow {
  sectionId: string;
  subjectId: string;
  staff: Ref | null;
  assignmentId: string | null;
  placed: number;
}

/** GET /classes/:id/setup */
export interface ClassSetup {
  class: { id: string; name: string; levelOrder: number; status: string };
  sections: OverviewSection[];
  subjects: ClassSubjectItem[];
  allocation: AllocationRow[];
  groups: string[];
  canEditStructure: boolean;
  canAllocate: boolean;
}

export interface ClassSubjectInput {
  subjectId: string;
  periodsPerWeek: number | null;
  isOptional: boolean;
  group: string | null;
}

/** GET /branches/:id/teaching-staff */
export interface TeachingStaff {
  id: string;
  name: string;
  designation: string;
  hasLogin: boolean;
  allocatedPeriods: number;
  placedPeriods: number;
  sections: number;
}
