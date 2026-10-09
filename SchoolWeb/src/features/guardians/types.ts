import type { GuardianInput, Relation } from "@/features/people/types";

export type GuardianLinkStatus = "REQUESTED" | "VERIFIED" | "REJECTED" | "REVOKED";

/** phase2-contract §4 — cnic comes masked. */
export interface Guardian extends GuardianInput {
  id: string;
  userId: string | null;
  hasAccount: boolean;
}

export interface GuardianChild {
  studentId: string;
  /** Also the parent's sign-in username. */
  admissionNo?: string;
  name: string;
  className: string | null;
  sectionName: string | null;
  relation: Relation;
  status: GuardianLinkStatus;
  /** Not in the contract; used when the API sends it, else resolved from the student. */
  linkId?: string;
}

/** The parent login behind a guardian; its email/phone may differ from the record's. */
export interface GuardianLogin {
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "DISABLED";
  /** Still on a temporary password. */
  mustChangePassword: boolean;
  lastLoginAt: string | null;
}

export interface GuardianDetail extends Guardian {
  login: GuardianLogin | null;
  children: GuardianChild[];
}

export interface GuardianLink {
  id: string;
  guardian: Guardian;
  relation: Relation;
  isPrimary: boolean;
  status: GuardianLinkStatus;
  verifiedAt: string | null;
}

/** POST /students/:id/guardians: the link plus the guardian's parent sign-in. */
export interface AddedGuardianLink extends GuardianLink {
  parentLogin: ParentLogin | null;
}

export interface LinkGuardianInput {
  guardianId?: string;
  guardian?: GuardianInput;
  relation: Relation;
  isPrimary: boolean;
}

export interface ChildLinkRequest {
  id: string;
  guardian: { id: string; name: string; phone: string };
  student: { id: string; name: string; admissionNo: string; className: string | null; sectionName: string | null };
  relation: Relation;
  status: GuardianLinkStatus;
  createdAt: string;
}

export interface ChildLinkStart {
  admissionNo: string;
  dob: string;
  relation: Relation;
}

export interface ChildLinkStarted {
  requestId: string;
  maskedPhone: string;
  /** Development only. */
  devCode?: string;
}

export interface ContactChangeInput {
  phone?: string;
  email?: string;
  address?: string;
}

/** A guardian's parent sign-in after admission, adding a guardian, creating or resetting it. */
export interface ParentLogin {
  guardianId: string;
  guardianName: string;
  status: "CREATED" | "EXISTING" | "SKIPPED";
  email: string | null;
  phone: string | null;
  /** Shown once. */
  temporaryPassword: string | null;
  reason: string | null;
}

/** The child whose admission number doubles as the parent's username. */
export interface SlipChild {
  name: string;
  admissionNo: string;
  /** "Class 5 - A" when known. */
  classLabel?: string | null;
  photoUrl?: string | null;
}
