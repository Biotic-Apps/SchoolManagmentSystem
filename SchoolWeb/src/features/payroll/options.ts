import type { Option } from "@/components/shared/OptionSelect";
import type { StepperStep } from "@/components/shared/StatusStepper";
import type { BadgeTone } from "@/components/ui/Badge";
import type { AdjustmentKind, PaymentMethod, PayrollRunStatus } from "./types";

export const RUN_STEPS: StepperStep[] = [
  { id: "DRAFT", label: "Draft" },
  { id: "CALCULATED", label: "Calculated" },
  { id: "REVIEWED", label: "Reviewed" },
  { id: "APPROVED", label: "Approved" },
  { id: "PARTIALLY_PAID", label: "Partly paid" },
  { id: "PAID", label: "Paid" },
  { id: "CLOSED", label: "Closed" },
];

/** Run statuses in which salaries can be paid. */
export const PAYABLE_STATUSES: PayrollRunStatus[] = ["APPROVED", "PARTIALLY_PAID"];

/** Run statuses that have calculated lines (payslips exist). */
export const CALCULATED_STATUSES: PayrollRunStatus[] = ["CALCULATED", "REVIEWED", "APPROVED", "PARTIALLY_PAID", "PAID", "CLOSED"];

export const PAYMENT_METHOD_OPTIONS: { id: PaymentMethod; name: string }[] = [
  { id: "CASH", name: "Cash" },
  { id: "BANK", name: "Bank transfer" },
  { id: "CHEQUE", name: "Cheque" },
];

export const ADJUSTMENT_KIND_LABEL: Record<AdjustmentKind, string> = {
  BONUS: "Bonus",
  ARREAR: "Arrears",
  DEDUCTION: "Deduction",
  ADVANCE: "Advance / loan recovery",
  FINE: "Fine",
};

/** What each kind does to pay, shown under the kind picker. */
export const ADJUSTMENT_KIND_HINT: Record<AdjustmentKind, string> = {
  BONUS: "Added to this month's pay.",
  ARREAR: "Pay owed from an earlier month, added to this month.",
  DEDUCTION: "Taken off this month's pay.",
  ADVANCE: "Recovers an advance or loan instalment from this month's pay.",
  FINE: "A fine taken off this month's pay.",
};

export const ADJUSTMENT_KIND_OPTIONS: Option[] = (Object.keys(ADJUSTMENT_KIND_LABEL) as AdjustmentKind[]).map((id) => ({
  id,
  name: ADJUSTMENT_KIND_LABEL[id],
}));

/** Additions read as success, recoveries as warning. */
export const ADJUSTMENT_KIND_TONE: Record<AdjustmentKind, BadgeTone> = {
  BONUS: "success",
  ARREAR: "success",
  DEDUCTION: "warning",
  ADVANCE: "warning",
  FINE: "warning",
};

/** Staff types for payroll filters (designation codes). */
export const STAFF_TYPE_OPTIONS: Option[] = [
  { id: "PRINCIPAL", name: "Principal" },
  { id: "HEAD_TEACHER", name: "Head teacher" },
  { id: "COORDINATOR", name: "Coordinator" },
  { id: "TEACHER", name: "Teacher" },
  { id: "ACCOUNTANT", name: "Accountant" },
  { id: "OFFICE_STAFF", name: "Office staff" },
  { id: "HELPER", name: "Helper" },
  { id: "OTHER", name: "Other" },
];

/** "3 h", "2 h 30 min", "45 min". */
export function hoursText(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
