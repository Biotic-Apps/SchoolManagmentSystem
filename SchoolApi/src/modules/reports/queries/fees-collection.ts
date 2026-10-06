import { formatDate, parseDate } from '../../../core/common/dates';
import type { ReportRow } from '../report-table';
import { branchName, str, type ReportQuery } from './report-query';

/** Recorded payments (reversed ones excluded) per day, method and cashier. */
export const feesCollection: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const from = str(params, 'from');
  const to = str(params, 'to');
  const groups = await prisma.payment.groupBy({
    by: ['receivedOn', 'method', 'receivedById'],
    where: {
      branchId,
      status: { not: 'REVERSED' },
      receivedOn: { gte: parseDate(from), lte: parseDate(to) },
    },
    _sum: { amountMinor: true },
    _count: { _all: true },
  });
  const cashiers = await prisma.user.findMany({
    where: { id: { in: [...new Set(groups.map((g) => g.receivedById))] } },
    select: { id: true, name: true },
  });
  const names = new Map(cashiers.map((c) => [c.id, c.name]));
  const rows: ReportRow[] = groups
    .map((g) => ({
      date: formatDate(g.receivedOn),
      method: g.method,
      cashier: names.get(g.receivedById) ?? '',
      payments: g._count._all,
      amount: g._sum.amountMinor ?? 0n,
    }))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.method.localeCompare(b.method) ||
        a.cashier.localeCompare(b.cashier),
    );
  rows.push({
    date: 'Total',
    method: null,
    cashier: null,
    payments: groups.reduce((n, g) => n + g._count._all, 0),
    amount: groups.reduce((sum, g) => sum + (g._sum.amountMinor ?? 0n), 0n),
  });
  return {
    title: `Fee collection — ${await branchName(prisma, branchId)} — ${from} to ${to}`,
    columns: [
      { key: 'date', header: 'Date' },
      { key: 'method', header: 'Method' },
      { key: 'cashier', header: 'Received by' },
      { key: 'payments', header: 'Payments', kind: 'int' },
      { key: 'amount', header: 'Amount', kind: 'money' },
    ],
    rows,
  };
};
