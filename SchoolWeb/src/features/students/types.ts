import type { SchoolDocument } from "@/features/documents/types";
import type { GuardianLink } from "@/features/guardians/types";
import type { ChildInput, Gender, GuardianEntry, MedicalInfo, PersonRef } from "@/features/people/types";

export type StudentStatus = "ACTIVE" | "WITHDRAWN" | "TRANSFERRED" | "GRADUATED";

export type EnrollmentStatus = "ACTIVE" | "WITHDRAWN" | "TRANSFERRED_OUT" | "PROMOTED" | "REPEATED" | "GRADUATED";

export interface StudentSummary {
  id: string;
  admissionNo: string;
  name: string;
  photoUrl: string | null;
  gender: Gender;
  dob: string;
  className: string | null;
  sectionName: string | null;
  sectionId: string | null;
  branchName: string | null;
  rollNo: number | null;
  status: StudentStatus;
  primaryGuardian: { name: string; phone: string } | null;
}

export interface Enrollment {
  id: string;
  branchId: string;
  branchName: string;
  sessionId: string;
  sessionName: string;
  sectionId: string;
  className: string;
  sectionName: string;
  rollNo: number | null;
  startDate: string;
  endDate: string | null;
  status: EnrollmentStatus;
  reason: string | null;
}

export interface StudentDetail extends StudentSummary {
  firstName: string;
  lastName: string;
  /** Masked unless the caller holds people.sensitive.view. */
  bForm: string | null;
  address: string | null;
  admissionDate: string | null;
  enrollment: Enrollment | null;
  guardians: GuardianLink[];
  documents: SchoolDocument[];
  /** Only with health.view. */
  medical: MedicalInfo | null;
}

export interface RegisterStudentInput {
  child: ChildInput;
  guardians: GuardianEntry[];
  sectionId: string;
  admissionDate: string;
}

export interface StudentUpdate {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: Gender;
  bForm?: string;
  photoFileId?: string;
  address?: string;
}

export interface WithdrawInput {
  effectiveDate: string;
  reason: string;
}

export interface ChangeSectionInput {
  sectionId: string;
  effectiveDate: string;
  reason: string;
}

export interface TransferRequestInput {
  toBranchId: string;
  effectiveDate: string;
  reason: string;
}

export type TransferStatus = "REQUESTED" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface Transfer {
  id: string;
  student: { id: string; name: string; admissionNo: string };
  fromBranch: PersonRef;
  toBranch: PersonRef;
  effectiveDate: string;
  reason: string | null;
  status: TransferStatus;
  createdAt: string;
}

export type IdCardStatus = "PENDING" | "READY" | "FAILED";

export interface IdCard {
  status: IdCardStatus;
  fileUrl: string | null;
  version: number | null;
  generatedAt: string | null;
}
