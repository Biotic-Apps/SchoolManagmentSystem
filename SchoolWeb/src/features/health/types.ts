import type { Attachment } from "@/features/files/types";
import type { PersonRef } from "@/features/people/types";

export interface Allergy {
  name: string;
  severity: string;
  reaction: string | null;
}

export interface HealthProfile {
  bloodGroup: string | null;
  allergies: Allergy[];
  conditions: string[];
  medications: { name: string; dose: string | null; schedule: string | null }[];
  instructions: string | null;
  doctor: { name: string; phone: string } | null;
  emergencyContacts: { name: string; relation: string; phone: string; priority: number }[];
  updatedAt: string | null;
}

/** GET /health/alerts — students of a section with allergies or medical instructions. */
export interface HealthAlert {
  studentId: string;
  name: string;
  allergies: Allergy[];
  conditions?: string[];
  instructions: string | null;
}

export type IncidentType = "INJURY" | "ILLNESS" | "ALLERGIC_REACTION" | "OTHER";
export type IncidentSeverity = "MINOR" | "MODERATE" | "SERIOUS";

export interface Incident {
  id: string;
  student: PersonRef & { className?: string | null; sectionName?: string | null };
  occurredAt: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  actionTaken: string;
  status: string;
  reportedBy: PersonRef | null;
  closeNote?: string | null;
}

export interface IncidentInput {
  studentId: string;
  occurredAt: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  actionTaken: string;
  attachmentFileIds?: string[];
}

export type IncidentStatus = "OPEN" | "CLOSED";

/** Incident fields the API may add beyond the contract summary. */
export interface IncidentExtras {
  attachments?: Attachment[];
  closedAt?: string | null;
  closedBy?: PersonRef | null;
}

export type IncidentDetail = Incident & IncidentExtras;

export type HealthProfileInput = Omit<HealthProfile, "updatedAt">;

export interface IncidentFilters {
  branchId?: string | null;
  studentId?: string | null;
  from?: string;
  to?: string;
  page?: number;
}
