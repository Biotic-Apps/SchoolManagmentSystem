import type { BadgeTone } from "@/components/ui/Badge";

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  ACTIVE: "success",
  APPROVED: "success",
  PAID: "success",
  PRESENT: "success",
  PUBLISHED: "success",
  VERIFIED: "success",
  COMPLETED: "success",
  PENDING: "warning",
  LATE: "warning",
  PARTIAL: "warning",
  RETURNED: "warning",
  SUBMITTED: "warning",
  ABSENT: "error",
  OVERDUE: "error",
  REJECTED: "error",
  FAILED: "error",
  CANCELLED: "error",
  DRAFT: "info",
  LEAVE: "info",
  INFO: "info",
  ARCHIVED: "neutral",
  INACTIVE: "neutral",
  CLOSED: "neutral",
  DISABLED: "error",
};

export function statusTone(status: string): BadgeTone {
  return TONE_BY_STATUS[status.toUpperCase()] ?? "neutral";
}
