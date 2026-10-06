import type { PayrollLine, Payslip, SalaryStructure, SalaryStructureHistory } from "./types";

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

/** Payslip as a flat line (+ month, pdfUrl/fileUrl) or nested `{ payslip, pdfUrl }`. */
export function toPayslip(raw: unknown): Payslip | null {
  if (!isRecord(raw)) return null;
  const line = isRecord(raw.payslip) ? raw.payslip : isRecord(raw.line) ? raw.line : raw;
  if (!text(line.staffId) && !text(line.name)) return null;
  return {
    staffId: text(line.staffId) ?? "",
    name: text(line.name) ?? "",
    designation: text(line.designation),
    basicMinor: num(line.basicMinor),
    allowancesMinor: num(line.allowancesMinor),
    deductionsMinor: num(line.deductionsMinor),
    unpaidLeaveDays: num(line.unpaidLeaveDays),
    leaveDeductionMinor: num(line.leaveDeductionMinor),
    adjustmentsMinor: num(line.adjustmentsMinor),
    netMinor: num(line.netMinor),
    paidMinor: num(line.paidMinor),
    balanceMinor: num(line.balanceMinor),
    status: text(line.status) ?? "",
    month: text(line.month) ?? text(raw.month),
    pdfUrl: text(raw.pdfUrl) ?? text(raw.fileUrl) ?? text(line.pdfUrl) ?? text(line.fileUrl),
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
