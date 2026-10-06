import type { PersonRef } from "@/features/people/types";

export type PickupPersonStatus = "PENDING_VERIFICATION" | "VERIFIED" | "REVOKED";

export interface PickupPerson {
  id: string;
  studentId: string;
  name: string;
  relation: string;
  cnic: string | null;
  phone: string;
  photoUrl: string | null;
  status: PickupPersonStatus;
}

export interface PickupPersonInput {
  name: string;
  relation: string;
  cnic?: string;
  phone: string;
  photoFileId?: string;
}

export type EarlyLeaveStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface EarlyLeave {
  id: string;
  student: PersonRef & { className?: string | null; sectionName?: string | null };
  date: string;
  time: string;
  reason: string;
  pickupPerson: PersonRef | null;
  status: EarlyLeaveStatus;
  requestedBy: PersonRef | null;
  decidedBy?: PersonRef | null;
}

export interface EarlyLeaveInput {
  studentId: string;
  date: string;
  time: string;
  reason: string;
  pickupPersonId?: string;
}

export interface Departure {
  id: string;
  student: PersonRef & { className?: string | null; sectionName?: string | null };
  at: string;
  pickedUpBy: { name: string; relation?: string | null } | null;
  earlyLeaveId: string | null;
  recordedBy: PersonRef | null;
}

export interface DepartureInput {
  studentId: string;
  earlyLeaveId?: string;
  pickedUpBy: { pickupPersonId?: string; guardianId?: string };
  at?: string;
}

export interface EarlyLeaveFilters {
  branchId?: string | null;
  date?: string;
  status?: string;
  studentId?: string | null;
}

export type DecideEarlyLeave = { id: string; action: "approve" | "reject"; reason?: string };
