import { formatMinor } from '../../finance-core/money';
import type {
  DetailAttendance,
  DetailOvertime,
  LineDetail,
} from '../calculation/line-detail';
import {
  adjustmentSign,
  type AdjustmentKind,
} from '../calculation/payroll-calc';

/** One printed row of a payslip. */
export interface BreakdownItem {
  label: string;
  /** Plain-English working, e.g. "2 days × PKR 3,000.00". */
  note: string | null;
  amountMinor: number;
}

export interface PayBreakdown {
  earnings: BreakdownItem[];
  deductions: BreakdownItem[];
  totalEarningsMinor: number;
  totalDeductionsMinor: number;
  attendance: DetailAttendance | null;
  overtime: DetailOvertime | null;
}

/** Stored line columns the breakdown needs. */
export interface BreakdownLine {
  basicMinor: bigint;
  leaveDeductionMinor: bigint;
  unpaidLeaveDays: unknown;
  overtimeMinor: bigint;
}

const KIND_LABEL: Record<AdjustmentKind, string> = {
  BONUS: 'Bonus',
  ARREAR: 'Arrears',
  DEDUCTION: 'Deduction',
  ADVANCE: 'Advance / loan recovery',
  FINE: 'Fine',
};

const money = (minor: number) => formatMinor(BigInt(minor));
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const days = (halfDays: number) => {
  const n = halfDays / 2;
  return `${n} ${n === 1 ? 'day' : 'days'}`;
};

export function hoursText(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function absenceNote(a: DetailAttendance): string {
  const parts = [
    a.absent ? plural(a.absent, 'absent day') : '',
    a.unpaidLeave ? plural(a.unpaidLeave, 'unpaid leave day') : '',
    a.halfDays ? plural(a.halfDays, 'half day') : '',
  ].filter(Boolean);
  return `${parts.join(', ')}: ${days(a.absenceHalfDays)} × ${money(a.perDayMinor)} a day`;
}

function absenceLabel(a: DetailAttendance): string {
  if (!a.absent && !a.halfDays) return 'Unpaid leave';
  return a.unpaidLeave ? 'Absent days & unpaid leave' : 'Absent days';
}

function lateNote(a: DetailAttendance): string {
  const rule = `${a.latesPerDeduction} lates = ${a.lateDeductionDays} ${a.lateDeductionDays === 1 ? 'day' : 'days'}`;
  return `${plural(a.late, 'late arrival')} (${rule}): ${days(a.lateHalfDays)} × ${money(a.perDayMinor)} a day`;
}

function overtimeNote(o: DetailOvertime): string {
  const rate = `${money(o.hourlyRateMinor)} an hour`;
  return o.multiplier === null
    ? `${hoursText(o.minutes)} × ${rate} (fixed rate)`
    : `${hoursText(o.minutes)} × ${rate} (${o.multiplier}× basic hourly)`;
}

/** Earnings and deductions of a line as printable rows (web, Android, PDF). */
export function buildBreakdown(
  line: BreakdownLine,
  detail: LineDetail,
): PayBreakdown {
  const earnings: BreakdownItem[] = [
    { label: 'Basic salary', note: null, amountMinor: Number(line.basicMinor) },
    ...detail.allowances.map((a) => ({
      label: a.name,
      note: null,
      amountMinor: a.amountMinor,
    })),
  ];
  const deductions: BreakdownItem[] = detail.deductions.map((d) => ({
    label: d.name,
    note: null,
    amountMinor: d.amountMinor,
  }));
  const o = detail.overtime;
  if (line.overtimeMinor > 0n && o) {
    earnings.push({
      label: 'Overtime',
      note: overtimeNote(o),
      amountMinor: Number(line.overtimeMinor),
    });
  }
  const a = detail.attendance;
  if (a) {
    if (a.absenceDeductionMinor > 0)
      deductions.push({
        label: absenceLabel(a),
        note: absenceNote(a),
        amountMinor: a.absenceDeductionMinor,
      });
    if (a.lateDeductionMinor > 0)
      deductions.push({
        label: 'Late arrivals',
        note: lateNote(a),
        amountMinor: a.lateDeductionMinor,
      });
  } else if (line.leaveDeductionMinor > 0n) {
    deductions.push({
      label: 'Unpaid leave',
      note: `${Number(line.unpaidLeaveDays)} days`,
      amountMinor: Number(line.leaveDeductionMinor),
    });
  }
  for (const adj of detail.adjustments) {
    const item = {
      label: KIND_LABEL[adj.kind],
      note: adj.reason || null,
      amountMinor: adj.amountMinor,
    };
    (adjustmentSign(adj.kind) > 0n ? earnings : deductions).push(item);
  }
  const total = (rows: BreakdownItem[]) =>
    rows.reduce((sum, r) => sum + r.amountMinor, 0);
  return {
    earnings,
    deductions,
    totalEarningsMinor: total(earnings),
    totalDeductionsMinor: total(deductions),
    attendance: a ?? null,
    overtime: o ?? null,
  };
}
