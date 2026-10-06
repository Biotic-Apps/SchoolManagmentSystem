import type { PersonRef } from "@/features/people/types";

export type CertificateType = "SCHOOL_LEAVING" | "TRANSFER" | "CHARACTER" | "ATTENDANCE" | "ACHIEVEMENT";

export type CertificateStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "ISSUED";

/** Contract lists fields loosely; everything past id/type/status is read tolerantly. */
export interface Certificate {
  id: string;
  type: CertificateType;
  status: CertificateStatus;
  serial?: string | null;
  serialNo?: string | null;
  student?: (PersonRef & { admissionNo?: string | null; className?: string | null; sectionName?: string | null }) | null;
  studentId?: string;
  studentName?: string | null;
  purpose?: string | null;
  details?: { activityId?: string | null; achievement?: string | null } | null;
  requestedBy?: PersonRef | null;
  createdAt?: string | null;
  requestedAt?: string | null;
  approvedAt?: string | null;
  issuedAt?: string | null;
  issuedOn?: string | null;
  fileUrl?: string | null;
  duplicate?: boolean;
  isDuplicate?: boolean;
  reissueCount?: number | null;
  rejectionReason?: string | null;
  reason?: string | null;
}

export interface CertificateInput {
  studentId: string;
  type: CertificateType;
  purpose?: string;
  details?: { activityId?: string; achievement?: string };
}

/** 409 CLEARANCE_REQUIRED details, read tolerantly. */
export interface ClearanceDetails {
  outstandingMinor?: number | null;
  balanceMinor?: number | null;
  currency?: string | null;
  items?: { name: string; quantity?: number | null }[] | null;
  reasons?: string[] | null;
}

export type CertificateAction = "approve" | "reject" | "issue" | "reissue";
