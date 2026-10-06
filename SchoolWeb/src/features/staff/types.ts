import type { SchoolDocument } from "@/features/documents/types";
import type { PersonRef } from "@/features/people/types";

export type StaffStatus = "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "TERMINATED";

export type StaffRoleKey = "TEACHER" | "HELPER" | "COORDINATOR" | "HEAD_TEACHER" | "ACCOUNTANT";

export type AssignmentKind = "CLASS_TEACHER" | "SUBJECT_TEACHER" | "HELPER" | "COORDINATOR" | "HEAD_TEACHER";

export interface StaffSummary {
  id: string;
  userId: string | null;
  name: string;
  photoUrl: string | null;
  employeeNo: string | null;
  designation: string;
  /** Not in the contract's StaffSummary; used when present, else matched by branchName. */
  branchId?: string | null;
  branchName: string | null;
  status: StaffStatus;
  roles: string[];
  requiresReview: boolean;
  reviewer: PersonRef | null;
  sectionCount: number;
  subjectCount: number;
}

export interface StaffAssignment {
  id: string;
  kind: AssignmentKind;
  sessionId: string;
  sectionId: string | null;
  sectionName: string | null;
  className: string | null;
  subjectId: string | null;
  subjectName: string | null;
  responsibleStaff: PersonRef | null;
  validUntil: string | null;
  isSubstitute: boolean;
}

export interface StaffDetail extends StaffSummary {
  email: string | null;
  phone: string | null;
  /** Masked. */
  cnic: string | null;
  qualification: string | null;
  joinDate: string | null;
  assignments: StaffAssignment[];
  documents: SchoolDocument[];
}

export interface StaffInput {
  name: string;
  email?: string;
  phone?: string;
  employeeNo?: string;
  designation: string;
  joinDate: string;
  branchId: string;
  cnic?: string;
  qualification?: string;
  photoFileId?: string;
  createAccount: boolean;
  roleKey?: StaffRoleKey;
}

export type StaffUpdate = Partial<Omit<StaffInput, "branchId" | "createAccount" | "roleKey">>;

export interface CreatedStaff {
  staff: StaffDetail;
  temporaryPassword?: string;
}

export interface StaffStatusInput {
  status: StaffStatus;
  effectiveDate: string;
  reason: string;
}

export interface ProbationInput {
  requiresReview: boolean;
  reviewerUserId?: string;
}

export interface AssignmentInput {
  kind: AssignmentKind;
  sessionId: string;
  branchId: string;
  sectionId?: string;
  subjectId?: string;
  responsibleStaffId?: string;
  validUntil?: string;
  isSubstitute?: boolean;
}

/** GET /staff/:id/workload — the contract leaves sections/subjects open (count or list). */
export interface StaffWorkload {
  periodsPerWeek: number;
  sections: number | WorkloadItem[];
  subjects: number | WorkloadItem[];
}

export interface WorkloadItem {
  id?: string;
  name?: string;
  className?: string;
  sectionName?: string;
  subjectName?: string;
  periods?: number;
}

/** GET /sections/:id/staff */
export interface SectionStaff {
  classTeacher: PersonRef | null;
  subjectTeachers: { staff: PersonRef; subject: PersonRef; isSubstitute?: boolean }[];
  helpers: PersonRef[];
}
