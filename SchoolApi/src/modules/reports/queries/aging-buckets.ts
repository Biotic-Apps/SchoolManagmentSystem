import type { ReportColumn } from '../report-table';
import { daysBetween } from './report-query';

export interface OpenBalance {
  studentId: string;
  dueDate: Date;
  balanceMinor: bigint;
}

export interface AgingRow {
  studentId: string;
  d0_30: bigint;
  d31_60: bigint;
  d61_90: bigint;
  d90plus: bigint;
  total: bigint;
  /** Days past due of the oldest unpaid invoice (0 when not yet due). */
  maxDays: number;
  oldestDue: Date;
  invoices: number;
}

export const AGING_COLUMNS: ReportColumn[] = [
  { key: 'd0_30', header: '0-30 days', kind: 'money' },
  { key: 'd31_60', header: '31-60 days', kind: 'money' },
  { key: 'd61_90', header: '61-90 days', kind: 'money' },
  { key: 'd90plus', header: '90+ days', kind: 'money' },
  { key: 'total', header: 'Total', kind: 'money' },
];

function bucket(days: number): 'd0_30' | 'd31_60' | 'd61_90' | 'd90plus' {
  if (days <= 30) return 'd0_30';
  if (days <= 60) return 'd31_60';
  if (days <= 90) return 'd61_90';
  return 'd90plus';
}

/**
 * Per student, open balances by days past the due date (not yet due counts
 * as 0–30). Rows are sorted by total, largest first.
 */
export function ageBalances(
  balances: readonly OpenBalance[],
  today: Date,
): AgingRow[] {
  const rows = new Map<string, AgingRow>();
  for (const b of balances) {
    if (b.balanceMinor <= 0n) continue;
    const days = Math.max(0, daysBetween(b.dueDate, today));
    const row = rows.get(b.studentId) ?? {
      studentId: b.studentId,
      d0_30: 0n,
      d31_60: 0n,
      d61_90: 0n,
      d90plus: 0n,
      total: 0n,
      maxDays: 0,
      oldestDue: b.dueDate,
      invoices: 0,
    };
    row[bucket(days)] += b.balanceMinor;
    row.total += b.balanceMinor;
    row.maxDays = Math.max(row.maxDays, days);
    if (b.dueDate < row.oldestDue) row.oldestDue = b.dueDate;
    row.invoices += 1;
    rows.set(b.studentId, row);
  }
  return [...rows.values()].sort((a, b) =>
    a.total === b.total ? 0 : a.total > b.total ? -1 : 1,
  );
}
