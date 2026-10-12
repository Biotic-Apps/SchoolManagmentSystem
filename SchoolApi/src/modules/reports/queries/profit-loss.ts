import { parseDate } from '../../../core/common/dates';
import type { ReportRow } from '../report-table';
import { branchName, str, type ReportQuery } from './report-query';

/** Profit & loss: fee collections + other income vs expenses + payroll. */
export const profitLoss: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const from = str(params, 'from');
  const to = str(params, 'to');
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  // Derive months that fall within the date range for payroll (YYYY-MM format).
  const fromMonth = from.slice(0, 7);
  const toMonth = to.slice(0, 7);

  const [feeCollections, otherIncomeGroups, expenseGroups, payrollRuns] =
    await Promise.all([
      // 1. Fee payments received in the period
      prisma.payment.aggregate({
        where: {
          branchId,
          status: { not: 'REVERSED' },
          receivedOn: { gte: fromDate, lte: toDate },
        },
        _sum: { amountMinor: true },
      }),

      // 2. Other income by category
      prisma.income.groupBy({
        by: ['categoryId'],
        where: {
          branchId,
          receivedOn: { gte: fromDate, lte: toDate },
        },
        _sum: { amountMinor: true },
      }),

      // 3. Expenses by category (non-draft, non-rejected)
      prisma.expense.groupBy({
        by: ['categoryId'],
        where: {
          branchId,
          status: { notIn: ['DRAFT', 'REJECTED'] },
          billDate: { gte: fromDate, lte: toDate },
        },
        _sum: { amountMinor: true },
      }),

      // 4. Payroll runs in period
      prisma.payrollRun.findMany({
        where: {
          branchId,
          month: { gte: fromMonth, lte: toMonth },
          status: { notIn: ['DRAFT'] },
        },
        select: {
          month: true,
          lines: { select: { netMinor: true } },
        },
      }),
    ]);

  // Resolve category names
  const [incomeCategories, expenseCategories] = await Promise.all([
    prisma.incomeCategory.findMany({
      where: { id: { in: otherIncomeGroups.map((g) => g.categoryId) } },
      select: { id: true, name: true },
    }),
    prisma.expenseCategory.findMany({
      where: { id: { in: expenseGroups.map((g) => g.categoryId) } },
      select: { id: true, name: true },
    }),
  ]);
  const incomeCatName = new Map(incomeCategories.map((c) => [c.id, c.name]));
  const expenseCatName = new Map(expenseCategories.map((c) => [c.id, c.name]));

  // Build rows
  const rows: ReportRow[] = [];

  // Income section
  const feeTotal = feeCollections._sum.amountMinor ?? 0n;
  rows.push({ section: 'INCOME', item: 'Fee collections', amount: feeTotal });

  let otherIncomeTotal = 0n;
  for (const g of otherIncomeGroups) {
    const amt = g._sum.amountMinor ?? 0n;
    otherIncomeTotal += amt;
    rows.push({
      section: 'INCOME',
      item: incomeCatName.get(g.categoryId) ?? 'Other income',
      amount: amt,
    });
  }

  const totalIncome = feeTotal + otherIncomeTotal;
  rows.push({ section: 'INCOME', item: 'Total income', amount: totalIncome });

  // Expense section
  let expenseTotal = 0n;
  for (const g of expenseGroups) {
    const amt = g._sum.amountMinor ?? 0n;
    expenseTotal += amt;
    rows.push({
      section: 'EXPENSE',
      item: expenseCatName.get(g.categoryId) ?? 'Expense',
      amount: amt,
    });
  }

  // Payroll
  let payrollTotal = 0n;
  for (const run of payrollRuns) {
    const runNet = run.lines.reduce((sum, line) => sum + line.netMinor, 0n);
    payrollTotal += runNet;
    rows.push({
      section: 'EXPENSE',
      item: `Payroll — ${run.month}`,
      amount: runNet,
    });
  }

  const totalExpenses = expenseTotal + payrollTotal;
  rows.push({
    section: 'EXPENSE',
    item: 'Total expenses',
    amount: totalExpenses,
  });

  // Net
  rows.push({
    section: 'NET',
    item: 'Net profit / (loss)',
    amount: totalIncome - totalExpenses,
  });

  return {
    title: `Profit & Loss — ${await branchName(prisma, branchId)} — ${from} to ${to}`,
    columns: [
      { key: 'section', header: 'Section' },
      { key: 'item', header: 'Item' },
      { key: 'amount', header: 'Amount', kind: 'money' },
    ],
    rows,
  };
};
