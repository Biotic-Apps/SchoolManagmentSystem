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
  name: string;
  className: string | null;
  sectionName: string | null;
  relation: Relation;
  status: GuardianLinkStatus;
  /** Not in the contract; used when the API sends it, else resolved from the student. */
  linkId?: string;
}

export interface GuardianDetail extends Guardian {
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
