import { roleLabel } from "@/config/roles";
import type { ApprovalRequest, ApprovalStep } from "./types";

export function approverLabel(step: ApprovalStep): string {
  if (step.approverRole) return roleLabel(step.approverRole);
  return step.approverUserId ? "Named approver" : "Approver";
}

export function decidedByName(value: ApprovalStep["decidedBy"]): string | null {
  if (!value) return null;
  return typeof value === "string" ? null : value.name;
}

/** Badge status for a step: its decision, else waiting on the current step or queued after it. */
export function stepStatus(step: ApprovalStep, request: ApprovalRequest): string {
  if (step.decision) return step.decision;
  return request.status === "PENDING" && step.order === request.currentStep ? "PENDING" : "WAITING";
}
