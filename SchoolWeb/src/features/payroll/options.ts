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
  DEDUCTION: "Deduction",
  ADVANCE: "Advance",
  ARREAR: "Arrear",
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
};
