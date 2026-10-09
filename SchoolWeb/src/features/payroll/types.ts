// Payroll shapes from docs/api/phase4-contract.md §C. Fields marked optional are not in the contract.

export type PayrollRunStatus = "DRAFT" | "CALCULATED" | "REVIEWED" | "APPROVED" | "PARTIALLY_PAID" | "PAID" | "CLOSED";

/** One printed row of a payslip; `note` is the plain-English working. */
export interface BreakdownItem {
  label: string;
  note: string | null;
  amountMinor: number;
}

export interface AttendanceSummary {
  calendarDays: number;
  payDays: number;
  present: number;
  late: number;
  absent: number;
  halfDays: number;
  paidLeave: number;
  unpaidLeave: number;
  unmarked: number;
  perDayBase: "GROSS" | "BASIC";
  perDayMinor: number;
  absenceHalfDays: number;
  absenceDeductionMinor: number;
  latesPerDeduction: number;
  lateDeductionDays: number;
  lateHalfDays: number;
  lateDeductionMinor: number;
}

export interface OvertimeSummary {
  minutes: number;
  hourlyRateMinor: number;
  multiplier: number | null;
  dailyHours: number;
  amountMinor: number;
  pendingMinutes: number;
}

export interface PayBreakdown {
  earnings: BreakdownItem[];
  deductions: BreakdownItem[];
  totalEarningsMinor: number;
  totalDeductionsMinor: number;
  attendance: AttendanceSummary | null;
  overtime: OvertimeSummary | null;
}

export interface PayrollLine {
  staffId: string;
  name: string;
  designation: string | null;
  employeeNo?: string | null;
  basicMinor: number;
  allowancesMinor: number;
  deductionsMinor: number;
  grossMinor: number;
  workingDays?: number;
  unpaidLeaveDays: number;
  leaveDeductionMinor: number;
  adjustmentsMinor: number;
  overtimeMinutes: number;
  overtimeMinor: number;
  breakdown: PayBreakdown | null;
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
  /** Overtime entries of the month still waiting for approval. */
  pendingOvertimeCount?: number;
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
  /** Fixed overtime pay per hour; null = school rule. */
  overtimeRateMinor?: number | null;
}

export type SalaryStructureInput = SalaryStructure;

/** GET /staff/:id/salary-structure, normalised from `{ current, history }` or a newest-first array. */
export interface SalaryStructureHistory {
  current: SalaryStructure | null;
  history: SalaryStructure[];
}

export type AdjustmentKind = "BONUS" | "ARREAR" | "DEDUCTION" | "ADVANCE" | "FINE";

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
  /** PENDING while the PDF is being made. */
  pdfStatus: string | null;
}

export interface PayrollSettings {
  workingDaysMode: "CALENDAR" | "FIXED";
  fixedWorkingDays: number;
  perDayBase: "GROSS" | "BASIC";
  latesPerDeduction: number;
  lateDeductionDays: number;
  overtimeEnabled: boolean;
  overtimeMultiplier: number;
  overtimeGraceMinutes: number;
  dailyHours: number | null;
}

export interface PayrollSettingsView extends PayrollSettings {
  saved: boolean;
  staffArrivesAt: string | null;
  staffLeavesAt: string | null;
  branchDailyHours: number | null;
}

export type OvertimeStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OvertimeEntry {
  id: string;
  staff: { id: string; name: string };
  designation: string;
  date: string;
  minutes: number;
  source: "ATTENDANCE" | "MANUAL";
  status: OvertimeStatus;
  reason: string | null;
  checkOut: string | null;
  decidedBy: { id: string; name: string } | null;
  decisionNote: string | null;
}

export interface OvertimeList {
  items: OvertimeEntry[];
  pendingCount: number;
  approvedMinutes: number;
  staffLeavesAt: string | null;
  overtimeEnabled: boolean;
  locked: boolean;
}

export interface OvertimeInput {
  staffId: string;
  date: string;
  minutes: number;
  reason: string;
}

export interface StaffSalarySummary {
  effectiveFrom: string;
  basicMinor: number;
  allowancesMinor: number;
  deductionsMinor: number;
  grossMinor: number;
  overtimeRateMinor: number | null;
}

export interface PayrollStaffRow {
  staffId: string;
  name: string;
  designation: string;
  employeeNo: string | null;
  status: string;
  salary: StaffSalarySummary | null;
}

export interface PayrollStaffList {
  items: PayrollStaffRow[];
  missingCount: number;
  principal: { userId: string; name: string; staffId: string | null } | null;
}
