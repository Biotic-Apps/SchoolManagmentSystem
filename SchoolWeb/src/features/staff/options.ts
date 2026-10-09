import type { Option } from "@/components/shared/OptionSelect";
import { roleLabel } from "@/config/roles";
import { humanize } from "@/lib/format";
import type { AssignmentKind, StaffRoleKey, StaffStatus } from "./types";

// The contract keeps designation as free text; the web offers this fixed list.
export const DESIGNATIONS = [
  "TEACHER",
  "HELPER",
  "COORDINATOR",
  "HEAD_TEACHER",
  "ACCOUNTANT",
  "OFFICE_STAFF",
  "OTHER",
] as const;

export const DESIGNATION_OPTIONS: Option[] = DESIGNATIONS.map((id) => ({ id, name: humanize(id) }));

/** Codes (incl. PRINCIPAL from payroll) are humanized; legacy free-text designations are shown as stored. */
export function designationLabel(value: string | null | undefined): string {
  if (!value) return "";
  return (DESIGNATIONS as readonly string[]).includes(value) || /^[A-Z_]+$/.test(value) ? humanize(value) : value;
}

export const STAFF_STATUSES: StaffStatus[] = ["ACTIVE", "ON_LEAVE", "RESIGNED", "TERMINATED"];

export const STAFF_STATUS_OPTIONS: Option[] = STAFF_STATUSES.map((id) => ({ id, name: humanize(id) }));

export const STAFF_ROLE_KEYS: StaffRoleKey[] = ["TEACHER", "HELPER", "COORDINATOR", "HEAD_TEACHER", "ACCOUNTANT"];

export const STAFF_ROLE_OPTIONS: Option[] = STAFF_ROLE_KEYS.map((id) => ({ id, name: roleLabel(id) }));

export const ASSIGNMENT_KINDS: AssignmentKind[] = [
  "CLASS_TEACHER",
  "SUBJECT_TEACHER",
  "HELPER",
  "COORDINATOR",
  "HEAD_TEACHER",
];

export const ASSIGNMENT_KIND_OPTIONS: Option[] = ASSIGNMENT_KINDS.map((id) => ({ id, name: humanize(id) }));

/** Kinds that always target one section. */
export const SECTION_KINDS: AssignmentKind[] = ["CLASS_TEACHER", "SUBJECT_TEACHER", "HELPER"];

/** Roles allowed to review a staff member on probation (contract §5). */
export const REVIEWER_ROLES = ["COORDINATOR", "HEAD_TEACHER", "PRINCIPAL"];

/** Status changes that disable the account and end assignments. */
export const LEAVING_STATUSES: StaffStatus[] = ["RESIGNED", "TERMINATED"];
