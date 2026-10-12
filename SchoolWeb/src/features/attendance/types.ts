import type { PersonRef } from "@/features/people/types";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HALF_DAY";

export type RegisterStatus = "UNMARKED" | "DRAFT" | "SUBMITTED" | "LOCKED" | "PENDING_REVIEW";

export interface RegisterEntry {
  entryId: string | null;
  studentId: string;
  name: string;
  rollNo: number | null;
  photoUrl: string | null;
  status: AttendanceStatus | null;
  remark: string | null;
  onLeave: boolean;
}

export interface Register {
  id: string | null;
  sectionId: string;
  date: string;
  status: RegisterStatus;
  version: number;
  submittedBy: PersonRef | null;
  onBehalfOf: PersonRef | null;
  lockedAt: string | null;
  entries: RegisterEntry[];
}

export interface RegisterEntryInput {
  studentId: string;
  status: AttendanceStatus;
  remark?: string;
}

export interface RegisterInput {
  sectionId: string;
  date: string;
  entries: RegisterEntryInput[];
  clientRequestId?: string;
}

/** Probation-gated actions answer PENDING_REVIEW with an approval id. */
export interface ProbationResult {
  status?: string;
  approvalId?: string;
}

export interface CorrectionInput {
  entryId: string;
  newStatus: AttendanceStatus;
  reason: string;
}

export interface AttendanceCounts {
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  unmarked: number;
  percent: number;
}

export interface StudentAttendance {
  entries: { date: string; status: AttendanceStatus | null; remark: string | null }[];
  summary: AttendanceCounts;
}

export interface SectionAttendanceRow {
  sectionId: string;
  className: string;
  sectionName: string;
  status: RegisterStatus;
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
}

export interface UnmarkedSection {
  sectionId: string;
  className: string;
  sectionName: string;
  status?: RegisterStatus;
  classTeacher?: PersonRef | null;
}

export interface StaffAttendanceEntry {
  staffId: string;
  name: string;
  designation: string | null;
  photoUrl: string | null;
  status: AttendanceStatus | null;
  checkIn: string | null;
  checkOut: string | null;
  remark: string | null;
}

export interface StaffAttendanceDay {
  branchId: string;
  date: string;
  entries: StaffAttendanceEntry[];
}

export interface StaffAttendanceInput {
  branchId: string;
  date: string;
  entries: { staffId: string; status: AttendanceStatus; checkIn?: string; checkOut?: string; remark?: string }[];
}

export interface MyStaffAttendance {
  entries: {
    date: string;
    status: AttendanceStatus | null;
    checkIn: string | null;
    checkOut: string | null;
    remark: string | null;
  }[];
  summary: AttendanceCounts;
}

export type LeaveKind = "STUDENT" | "STAFF";
export type LeaveType = "CASUAL" | "SICK" | "ANNUAL" | "UNPAID" | "OTHER";
export type LeaveStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Leave {
  id: string;
  kind: LeaveKind;
  subject: PersonRef;
  from: string;
  to: string;
  days: number;
  type: LeaveType | null;
  reason: string;
  status: LeaveStatus;
  requestedBy: PersonRef;
  decidedBy: PersonRef | null;
  comment: string | null;
  createdAt: string;
}

export interface StudentLeaveInput {
  studentId: string;
  from: string;
  to: string;
  reason: string;
  attachmentFileId?: string;
}

export interface StaffLeaveInput {
  from: string;
  to: string;
  type: LeaveType;
  reason: string;
}
