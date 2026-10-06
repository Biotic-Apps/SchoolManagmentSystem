import type { Complaint, ComplaintStatus } from "./types";

const STEP_IDS = new Set<ComplaintStatus>(["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

/** Stepper position; ESCALATED / REOPENED fall back to the last regular step reached. */
export function stepFor(complaint: Complaint): ComplaintStatus {
  if (STEP_IDS.has(complaint.status)) return complaint.status;
  const reached = [...complaint.updates].reverse().find((update) => update.status && STEP_IDS.has(update.status));
  if (reached?.status) return reached.status;
  return complaint.assignee ? "ASSIGNED" : "SUBMITTED";
}

export const isOpen = (status: ComplaintStatus) => status !== "RESOLVED" && status !== "CLOSED";

/** Level 1 = principal, level 2 = super admin (the top). */
export const MAX_ESCALATION_LEVEL = 2;

export function escalationLabel(level: number): string | null {
  if (level <= 0) return null;
  return level >= MAX_ESCALATION_LEVEL ? "Escalated to super admin" : "Escalated to principal";
}
