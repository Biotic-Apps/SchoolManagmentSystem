import type { ApprovalDecision } from "@/components/shared/ApprovalActions";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "CANCELLED";

export interface PersonRef {
  id: string;
  name: string;
}

export interface ApprovalStep {
  order: number;
  approverRole: string | null;
  approverUserId: string | null;
  decision: ApprovalDecision | null;
  comment: string | null;
  decidedAt: string | null;
  /** The contract leaves the shape open; the API may send a user id or {id,name}. */
  decidedBy: PersonRef | string | null;
}

export interface ApprovalRequest {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  branchId: string | null;
  title: string;
  requestedBy: PersonRef;
  status: ApprovalStatus;
  currentStep: number;
  createdAt: string;
  steps?: ApprovalStep[];
}

export interface DecideInput {
  decision: ApprovalDecision;
  comment?: string;
}
