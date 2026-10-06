// Payroll shapes from docs/api/phase4-contract.md §C. Fields marked optional are not in the contract.

export type PayrollRunStatus = "DRAFT" | "CALCULATED" | "REVIEWED" | "APPROVED" | "PARTIALLY_PAID" | "PAID" | "CLOSED";

export interface PayrollLine {
  staffId: string;
  name: string;
  designation: string | null;
  basicMinor: number;
  allowancesMinor: number;
  deductionsMinor: number;
  unpaidLeaveDays: number;
  leaveDeductionMinor: number;
  adjustmentsMinor: number;
  netMinor: number;
  paidMinor: number;
  balanceMinor: number;
  status: string;
}

export interface PayrollRun {
  id: string;
  branchId?: string;
  month: string;
  status: PayrollRunStatus;
  lines?: PayrollLine[];
  approval?: { id: string; status: string } | null;
  currency?: string;
}

export type PaymentMethod = "CASH" | "BANK" | "CHEQUE";

export interface PayrollPaymentInput {
  staffId: string;
  amountMinor: number;
  method: PaymentMethod;
  reference?: string;
  paidOn: string;
}

export interface SalaryItem {
  name: string;
  amountMinor: number;
}

export interface SalaryStructure {
  id?: string;
  effectiveFrom: string;
  basicMinor: number;
  allowances: SalaryItem[];
  deductions: SalaryItem[];
}

export type SalaryStructureInput = SalaryStructure;

/** GET /staff/:id/salary-structure, normalised from `{ current, history }` or a newest-first array. */
export interface SalaryStructureHistory {
  current: SalaryStructure | null;
  history: SalaryStructure[];
}

export type AdjustmentKind = "BONUS" | "DEDUCTION" | "ADVANCE" | "ARREAR";

export interface PayrollAdjustment {
  id: string;
  staffId: string;
  staff?: { id: string; name: string } | null;
  staffName?: string | null;
  month: string;
  kind: AdjustmentKind;
  amountMinor: number;
  reason: string;
  status?: string;
}

export interface AdjustmentInput {
  staffId: string;
  month: string;
  kind: AdjustmentKind;
  amountMinor: number;
  reason: string;
}

/** A payroll line for one month with its PDF, normalised by toPayslip(). */
export interface Payslip extends PayrollLine {
  month: string | null;
  pdfUrl: string | null;
}
