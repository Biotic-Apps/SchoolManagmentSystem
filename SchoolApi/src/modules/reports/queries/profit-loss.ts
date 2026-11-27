import { loadProfitLoss } from '../../income/profit-loss-figures';
import type { ReportRow } from '../report-table';
import { branchName, str, type ReportQuery } from './report-query';

/** Profit & loss on a cash basis (same figures as GET /profit-loss). */
export const profitLoss: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const from = str(params, 'from');
  const to = str(params, 'to');
  const figures = await loadProfitLoss(prisma, branchId, from, to);

  const rows: ReportRow[] = [];
  const section = (
    name: 'INCOME' | 'EXPENSE',
    total: bigint,
    label: string,
  ) => {
    for (const line of figures.lines.filter((l) => l.section === name)) {
      rows.push({ section: name, item: line.item, amount: line.amountMinor });
    }
    rows.push({ section: name, item: label, amount: total });
  };
  section('INCOME', figures.totalIncomeMinor, 'Total income');
  section('EXPENSE', figures.totalExpensesMinor, 'Total expenses');
  rows.push({
    section: 'NET',
    item: 'Net profit / (loss)',
    amount: figures.netMinor,
  });

  return {
    title: `Profit & Loss (cash basis) — ${await branchName(prisma, branchId)} — ${from} to ${to}`,
    columns: [
      { key: 'section', header: 'Section' },
      { key: 'item', header: 'Item' },
      { key: 'amount', header: 'Amount', kind: 'money' },
    ],
    rows,
  };
};
