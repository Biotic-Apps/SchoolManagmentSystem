import type { PayBreakdown, PayrollLine, Payslip, SalaryStructure, SalaryStructureHistory } from "./types";

type Loose = Record<string, unknown>;

function isRecord(value: unknown): value is Loose {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Lists may arrive as a plain array or as `{ data: [] }`. */
export function listFrom<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (isRecord(value) && Array.isArray(value.data)) return value.data as T[];
  return [];
}

const num = (value: unknown): number => (typeof value === "number" ? value : 0);
const text = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

const sumAmounts = (value: unknown): number =>
  Array.isArray(value) ? value.reduce((total: number, item) => total + (isRecord(item) ? num(item.amountMinor) : 0), 0) : 0;

/** Breakdown as sent by the API; older lines have none (null). */
function toBreakdown(value: unknown): PayBreakdown | null {
  if (!isRecord(value) || !Array.isArray(value.earnings)) return null;
  return value as unknown as PayBreakdown;
}

/**
 * GET /payslips/:staffId|me → `{ staff: { id, name, designation }, month, …, breakdown, pdf: { fileUrl } }`.
 * Flat line shapes (staffId/name at the top) are read too.
 */
export function toPayslip(raw: unknown): Payslip | null {
  if (!isRecord(raw)) return null;
  const staff = isRecord(raw.staff) ? raw.staff : {};
  const pdf = isRecord(raw.pdf) ? raw.pdf : {};
  const staffId = text(staff.id) ?? text(raw.staffId);
  const name = text(staff.name) ?? text(raw.name);
  if (!staffId && !name) return null;
  const basic = num(raw.basicMinor);
  const allowances = typeof raw.allowancesMinor === "number" ? raw.allowancesMinor : sumAmounts(raw.allowances);
  return {
    staffId: staffId ?? "",
    name: name ?? "",
    designation: text(staff.designation) ?? text(raw.designation),
    employeeNo: text(staff.employeeNo),
    basicMinor: basic,
    allowancesMinor: allowances,
    deductionsMinor: typeof raw.deductionsMinor === "number" ? raw.deductionsMinor : sumAmounts(raw.deductions),
    grossMinor: num(raw.grossMinor) || basic + allowances,
    workingDays: num(raw.workingDays),
    unpaidLeaveDays: num(raw.unpaidLeaveDays),
    leaveDeductionMinor: num(raw.leaveDeductionMinor),
    adjustmentsMinor: num(raw.adjustmentsMinor),
    overtimeMinutes: num(raw.overtimeMinutes),
    overtimeMinor: num(raw.overtimeMinor),
    breakdown: toBreakdown(raw.breakdown),
    netMinor: num(raw.netMinor),
    paidMinor: num(raw.paidMinor),
    balanceMinor: num(raw.balanceMinor),
    status: text(raw.status) ?? "",
    month: text(raw.month),
    pdfUrl: text(pdf.fileUrl) ?? text(raw.pdfUrl) ?? text(raw.fileUrl),
    pdfStatus: text(pdf.status),
  };
}

/** Salary structure as `{ current, history }` or an array ordered newest first. */
export function toStructureHistory(raw: unknown): SalaryStructureHistory {
  if (Array.isArray(raw)) {
    const [current = null, ...history] = raw as SalaryStructure[];
    return { current, history };
  }
  if (!isRecord(raw)) return { current: null, history: [] };
  if ("current" in raw || "history" in raw) {
    const current = isRecord(raw.current) ? (raw.current as unknown as SalaryStructure) : null;
    const history = listFrom<SalaryStructure>(raw.history).filter(
      (item) => !current || item.id !== current.id || item.effectiveFrom !== current.effectiveFrom,
    );
    return { current, history };
  }
  return { current: "basicMinor" in raw ? (raw as unknown as SalaryStructure) : null, history: [] };
}

export function sumItems(items: { amountMinor: number }[] | undefined): number {
  return (items ?? []).reduce((total, item) => total + (item.amountMinor ?? 0), 0);
}

export function structureTotals(structure: SalaryStructure) {
  const allowances = sumItems(structure.allowances);
  const deductions = sumItems(structure.deductions);
  const gross = structure.basicMinor + allowances;
  return { allowances, deductions, gross, net: gross - deductions };
}

export function runTotals(lines: PayrollLine[]) {
  return lines.reduce(
    (totals, line) => ({
      net: totals.net + line.netMinor,
      paid: totals.paid + line.paidMinor,
      balance: totals.balance + line.balanceMinor,
    }),
    { net: 0, paid: 0, balance: 0 },
  );
}
