import type { Option } from "@/components/shared/OptionSelect";
import type { BadgeTone } from "@/components/ui/Badge";
import type { AttendanceCounts, AttendanceStatus, LeaveStatus, LeaveType, RegisterStatus } from "./types";

export interface StatusChoice {
  id: AttendanceStatus;
  short: string;
  label: string;
  tone: BadgeTone;
}

export const STATUS_CHOICES: StatusChoice[] = [
  { id: "PRESENT", short: "P", label: "Present", tone: "success" },
  { id: "ABSENT", short: "A", label: "Absent", tone: "error" },
  { id: "LATE", short: "L", label: "Late", tone: "warning" },
  { id: "LEAVE", short: "Lv", label: "Leave", tone: "info" },
  { id: "HALF_DAY", short: "½", label: "Half day", tone: "primary" },
];

export const ATTENDANCE_STATUS_OPTIONS: Option[] = STATUS_CHOICES.map(({ id, label }) => ({ id, name: label }));

export const ATTENDANCE_STATUS_LABEL = Object.fromEntries(
  STATUS_CHOICES.map(({ id, label }) => [id, label]),
) as Record<AttendanceStatus, string>;

export const REGISTER_STATUS_LABEL: Record<RegisterStatus, string> = {
  UNMARKED: "Not marked",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  LOCKED: "Locked",
  PENDING_REVIEW: "Waiting for review",
};

export const LEAVE_TYPE_OPTIONS: { id: LeaveType; name: string }[] = [
  { id: "CASUAL", name: "Casual leave" },
  { id: "SICK", name: "Sick leave" },
  { id: "ANNUAL", name: "Annual leave" },
  { id: "UNPAID", name: "Unpaid leave" },
  { id: "OTHER", name: "Other" },
];

export const LEAVE_TYPE_LABEL = Object.fromEntries(LEAVE_TYPE_OPTIONS.map(({ id, name }) => [id, name])) as Record<
  LeaveType,
  string
>;

export const LEAVE_STATUS_OPTIONS: { id: LeaveStatus; name: string }[] = [
  { id: "SUBMITTED", name: "Waiting for decision" },
  { id: "APPROVED", name: "Approved" },
  { id: "REJECTED", name: "Rejected" },
  { id: "CANCELLED", name: "Cancelled" },
];

export const LEAVE_STATUS_LABEL = Object.fromEntries(LEAVE_STATUS_OPTIONS.map(({ id, name }) => [id, name])) as Record<
  LeaveStatus,
  string
>;

export const EMPTY_COUNTS: AttendanceCounts = {
  present: 0,
  absent: 0,
  late: 0,
  leave: 0,
  halfDay: 0,
  unmarked: 0,
  percent: 0,
};

const COUNT_KEY: Record<AttendanceStatus, keyof Omit<AttendanceCounts, "percent">> = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  LEAVE: "leave",
  HALF_DAY: "halfDay",
};

/** Tallies statuses; null stays "unmarked" (never counted as absent). */
export function countStatuses(statuses: (AttendanceStatus | null)[]): AttendanceCounts {
  const counts = { ...EMPTY_COUNTS };
  for (const status of statuses) {
    if (status) counts[COUNT_KEY[status]] += 1;
    else counts.unmarked += 1;
  }
  const marked = statuses.length - counts.unmarked;
  const attended = counts.present + counts.late + counts.halfDay * 0.5;
  counts.percent = marked ? Math.round((attended / marked) * 100) : 0;
  return counts;
}

export const COUNT_ITEMS: { key: keyof Omit<AttendanceCounts, "percent">; label: string; tone: BadgeTone }[] = [
  { key: "present", label: "Present", tone: "success" },
  { key: "absent", label: "Absent", tone: "error" },
  { key: "late", label: "Late", tone: "warning" },
  { key: "leave", label: "Leave", tone: "info" },
  { key: "halfDay", label: "Half day", tone: "primary" },
  { key: "unmarked", label: "Unmarked", tone: "neutral" },
];

export function percentTone(percent: number): "success" | "warning" | "error" {
  if (percent >= 85) return "success";
  if (percent >= 70) return "warning";
  return "error";
}

export function sectionLabel(row: { className: string; sectionName: string }): string {
  return `${row.className} ${row.sectionName}`;
}

/** Roles that see the branch-wide attendance views by default. */
export const SUPERVISOR_ROLES = new Set(["SUPER_ADMIN", "PRINCIPAL", "COORDINATOR", "HEAD_TEACHER"]);
