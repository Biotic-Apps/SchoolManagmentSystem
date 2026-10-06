import type { SchoolDocument } from "@/features/documents/types";
import type { ChildInput, GuardianEntry, MedicalInfo } from "@/features/people/types";

export type EnquiryStatus = "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED";

export type ApplicationStatus =
  | "SUBMITTED"
  | "DOCUMENTS_PENDING"
  | "TEST_SCHEDULED"
  | "TEST_COMPLETED"
  | "OFFERED"
  | "WAITLISTED"
  | "REJECTED"
  | "CONFIRMED"
  | "ENROLLED"
  | "EXPIRED"
  | "WITHDRAWN";

export interface Enquiry {
  id: string;
  branchId: string;
  sessionId: string;
  classId: string;
  className: string;
  childName: string;
  dob: string | null;
  guardianName: string;
  phone: string;
  email: string | null;
  source: string | null;
  notes: string | null;
  followUpDate: string | null;
  status: EnquiryStatus;
  createdAt: string;
}

export interface EnquiryInput {
  branchId: string;
  sessionId: string;
  classId: string;
  childName: string;
  dob?: string;
  guardianName: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  followUpDate?: string;
}

export interface EnquiryUpdate {
  status?: EnquiryStatus;
  notes?: string | null;
  followUpDate?: string | null;
}

export interface ApplicationInput {
  branchId: string;
  sessionId: string;
  classId: string;
  child: ChildInput;
  guardians: GuardianEntry[];
  medical?: MedicalInfo;
  notes?: string;
}

export interface ApplicationTest {
  scheduledAt: string;
  venue: string | null;
  score: number | null;
  maxScore: number | null;
  remarks: string | null;
}

export interface Application extends ApplicationInput {
  id: string;
  applicationNo: string;
  status: ApplicationStatus;
  className: string;
  waitlistPosition: number | null;
  test: ApplicationTest | null;
  documents: SchoolDocument[];
  decisionReason: string | null;
  studentId: string | null;
  createdAt: string;
}

export type Decision = "OFFER" | "WAITLIST" | "REJECT";

export type AdmissionFeeStatus = "PAID" | "WAIVED" | "PENDING";

export interface ConfirmInput {
  admissionFee: { status: AdmissionFeeStatus; reference?: string; amountMinor?: number };
  sectionId: string;
  admissionDate: string;
}

export interface TestInput {
  scheduledAt: string;
  venue?: string;
  notes?: string;
}

export interface TestResultInput {
  score: number;
  maxScore: number;
  remarks?: string;
}
