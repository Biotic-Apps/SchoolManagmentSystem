import type { PersonRef } from "@/features/people/types";

export type ComplaintCategory = "ACADEMIC" | "STAFF_BEHAVIOUR" | "FACILITY" | "TRANSPORT" | "FEE" | "SAFETY" | "OTHER";
export type ComplaintStatus =
  | "SUBMITTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "ESCALATED"
  | "REOPENED";
export type ComplaintBox = "mine" | "assigned" | "all";

export interface ComplaintUpdate {
  id: string;
  author: PersonRef | null;
  message: string;
  status: ComplaintStatus | null;
  at: string;
}

export interface Complaint {
  id: string;
  ticketNo: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  escalationLevel: number;
  slaDueAt: string | null;
  overdue: boolean;
  /** null when anonymous and the viewer is not principal/super admin. */
  complainant: (PersonRef & { role: string }) | null;
  against: PersonRef | null;
  student: PersonRef | null;
  assignee: PersonRef | null;
  updates: ComplaintUpdate[];
  createdAt: string;
}

export interface ComplaintInput {
  category: ComplaintCategory;
  subject: string;
  description: string;
  studentId?: string;
  againstUserId?: string;
  anonymous?: boolean;
  attachmentFileIds?: string[];
}

export interface ComplaintUpdateInput {
  message: string;
  status?: "IN_PROGRESS" | "RESOLVED";
  attachmentFileIds?: string[];
}
