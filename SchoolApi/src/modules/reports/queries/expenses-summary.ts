import { parseDate } from '../../../core/common/dates';
import { branchName, str, type ReportQuery } from './report-query';

/** Non-draft, non-rejected expenses by bill date, per category and vendor. */
export const expensesSummary: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const from = str(params, 'from');
  const to = str(params, 'to');
  const groups = await prisma.expense.groupBy({
    by: ['categoryId', 'vendorId'],
    where: {
      branchId,
      status: { notIn: ['DRAFT', 'REJECTED'] },
      billDate: { gte: parseDate(from), lte: parseDate(to) },
    },
    _sum: { amountMinor: true, paidMinor: true },
    _count: { _all: true },
  });
  const [categories, vendors] = await Promise.all([
    prisma.expenseCategory.findMany({
      where: { id: { in: groups.map((g) => g.categoryId) } },
      select: { id: true, name: true },
    }),
    prisma.vendor.findMany({
      where: {
        id: { in: groups.flatMap((g) => (g.vendorId ? [g.vendorId] : [])) },
      },
      select: { id: true, name: true },
    }),
  ]);
  const category = new Map(categories.map((c) => [c.id, c.name]));
  const vendor = new Map(vendors.map((v) => [v.id, v.name]));
  const rows = groups
    .map((g) => {
      const amount = g._sum.amountMinor ?? 0n;
      const paid = g._sum.paidMinor ?? 0n;
      return {
        category: category.get(g.categoryId) ?? '',
        vendor: g.vendorId ? (vendor.get(g.vendorId) ?? '') : '(no vendor)',
        expenses: g._count._all,
        amount,
        paid,
        outstanding: amount - paid,
      };
    })
    .sort(
      (a, b) =>
        a.category.localeCompare(b.category) ||
        a.vendor.localeCompare(b.vendor),
    );
  return {
    title: `Expenses — ${await branchName(prisma, branchId)} — ${from} to ${to}`,
    columns: [
      { key: 'category', header: 'Category' },
      { key: 'vendor', header: 'Vendor' },
      { key: 'expenses', header: 'Expenses', kind: 'int' },
      { key: 'amount', header: 'Amount', kind: 'money' },
      { key: 'paid', header: 'Paid', kind: 'money' },
      { key: 'outstanding', header: 'Outstanding', kind: 'money' },
    ],
    rows,
  };
};
