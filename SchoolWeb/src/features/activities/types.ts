import type { PersonRef } from "@/features/people/types";

export type ActivityType = "EVENT" | "SPORTS" | "TRIP" | "COMPETITION" | "CLUB";
export type ActivityStatus =
  | "PROPOSED"
  | "APPROVED"
  | "REJECTED"
  | "ANNOUNCED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";
export type ConsentStatus = "PENDING" | "GRANTED" | "DECLINED";

export interface ActivityAudience {
  sectionIds?: string[];
  classIds?: string[];
  wholeBranch?: boolean;
}

export interface Activity {
  id: string;
  branchId: string;
  type: ActivityType;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  venue: string | null;
  audience: ActivityAudience;
  consentRequired: boolean;
  consentDeadline: string | null;
  feeMinor: number | null;
  maxParticipants: number | null;
  status: ActivityStatus;
  proposedBy?: PersonRef | null;
  comment?: string | null;
  /** Rejection or cancellation reason. */
  reason?: string | null;
  createdAt?: string;
}

export interface ActivityInput {
  branchId: string;
  type: ActivityType;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  venue?: string;
  audience: ActivityAudience;
  consentRequired: boolean;
  consentDeadline?: string;
  feeMinor?: number;
  maxParticipants?: number;
}

export interface ConsentRow {
  student: PersonRef & { className?: string | null; sectionName?: string | null };
  guardian: PersonRef | null;
  status: ConsentStatus;
  respondedAt: string | null;
}

export interface ConsentCounts {
  pending: number;
  granted: number;
  declined: number;
  total?: number;
}

export interface ConsentList {
  consents: ConsentRow[];
  counts: ConsentCounts;
}

export interface Participant {
  studentId: string;
  name?: string;
  role: string | null;
  result: string | null;
  position: number | null;
  remarks: string | null;
}

/** GET /activities/mine — upcoming activities for the child, with the consent state when asked. */
export interface MyActivity extends Activity {
  consentStatus?: ConsentStatus | null;
}
