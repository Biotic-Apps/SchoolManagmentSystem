import type { Option } from "@/components/shared/OptionSelect";
import { humanize } from "@/lib/format";

export const APPROVAL_STATUS_OPTIONS: Option[] = ["PENDING", "APPROVED", "REJECTED", "RETURNED", "CANCELLED"].map(
  (id) => ({ id, name: humanize(id) }),
);

// docs/architecture.md §7
const APPROVAL_TYPES = [
  "HELPER_DRAFT",
  "PROBATION_REVIEW",
  "ATTENDANCE_CORRECTION",
  "LEAVE",
  "TIMETABLE_PUBLISH",
  "ACTIVITY",
  "DIARY_MODERATION",
  "RESULT_PUBLISH",
  "PROMOTION",
  "CONCESSION",
  "REFUND",
  "PAYMENT_REVERSAL",
  "PAYROLL",
  "EXPENSE",
  "PURCHASE_ORDER",
  "ADMISSION",
  "CHILD_LINK",
  "CONTACT_CHANGE",
  "EARLY_LEAVE",
  "CERTIFICATE",
];

export const APPROVAL_TYPE_OPTIONS: Option[] = APPROVAL_TYPES.map((id) => ({ id, name: humanize(id) }));
