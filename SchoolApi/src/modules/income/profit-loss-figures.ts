import { parseDate } from '../../core/common/dates';
import type { PrismaService } from '../../core/prisma/prisma.service';
import { refundsPaidWhere } from '../payments/refunds/refunds-paid';

/**
 * Profit & loss on one basis, CASH: money that came in or went out between
 * `from` and `to` (inclusive).
 * - Fees: payments received (not reversed) − refunds paid back (approved).
 * - Other income: income received.
 * - Expenses: vendor bill / expense payments made (not bills raised).
 * - Payroll: salaries paid (payroll payments) + the deductions withheld from
 *   salaries (income tax, EOBI, other) of runs approved for the months in the
 *   range — withheld money is still a staff cost even though staff did not get it.
 */
export const PROFIT_LOSS_BASIS = 'CASH' as const;

export interface NamedAmount {
  name: string;
  amountMinor: bigint;
}

export interface ProfitLossInputs {
  feeReceivedMinor: bigint;
  feeRefundedMinor: bigint;
  otherIncome: NamedAmount[];
  expensesPaid: NamedAmount[];
  salariesPaidMinor: bigint;
  withheldMinor: bigint;
}

export interface ProfitLossLine {
  section: 'INCOME' | 'EXPENSE';
  item: string;
  amountMinor: bigint;
}

export interface ProfitLossFigures {
  lines: ProfitLossLine[];
  totalIncomeMinor: bigint;
  totalExpensesMinor: bigint;
  netMinor: bigint;
}

/** Runs whose salaries are approved (withheld deductions are owed). */
const PAYROLL_APPROVED = [
  'APPROVED',
  'PARTIALLY_PAID',
  'PAID',
  'CLOSED',
] as const;

export function buildProfitLoss(inputs: ProfitLossInputs): ProfitLossFigures {
  const lines: ProfitLossLine[] = [
    {
      section: 'INCOME',
      item: 'Fee collections',
      amountMinor: inputs.feeReceivedMinor,
    },
  ];
  if (inputs.feeRefundedMinor > 0n) {
    lines.push({
      section: 'INCOME',
      item: 'Fee refunds paid',
      amountMinor: -inputs.feeRefundedMinor,
    });
  }
  for (const income of inputs.otherIncome) {
    lines.push({
      section: 'INCOME',
      item: income.name,
      amountMinor: income.amountMinor,
    });
  }
  for (const expense of inputs.expensesPaid) {
    lines.push({
      section: 'EXPENSE',
      item: expense.name,
      amountMinor: expense.amountMinor,
    });
  }
  lines.push({
    section: 'EXPENSE',
    item: 'Salaries paid',
    amountMinor: inputs.salariesPaidMinor,
  });
  if (inputs.withheldMinor > 0n) {
    lines.push({
      section: 'EXPENSE',
      item: 'Salary deductions withheld (tax, EOBI, other)',
      amountMinor: inputs.withheldMinor,
    });
  }
  const sum = (section: ProfitLossLine['section']) =>
    lines
      .filter((line) => line.section === section)
      .reduce((total, line) => total + line.amountMinor, 0n);
  const totalIncomeMinor = sum('INCOME');
  const totalExpensesMinor = sum('EXPENSE');
  return {
    lines,
    totalIncomeMinor,
    totalExpensesMinor,
    netMinor: totalIncomeMinor - totalExpensesMinor,
  };
}

/** Group amounts by a key and name each group (unknown keys → `fallback`). */
function named(
  groups: { key: string; amountMinor: bigint }[],
  names: ReadonlyMap<string, string>,
  fallback: string,
): NamedAmount[] {
  const totals = new Map<string, bigint>();
  for (const group of groups) {
    totals.set(group.key, (totals.get(group.key) ?? 0n) + group.amountMinor);
  }
  return [...totals].map(([key, amountMinor]) => ({
    name: names.get(key) ?? fallback,
    amountMinor,
  }));
}

export async function loadProfitLoss(
  prisma: PrismaService,
  branchId: string,
  from: string,
  to: string,
): Promise<ProfitLossFigures> {
  const range = { gte: parseDate(from), lte: parseDate(to) };
  const [fees, refunds, incomeGroups, expensePayments, salaries, withheld] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { branchId, status: { not: 'REVERSED' }, receivedOn: range },
        _sum: { amountMinor: true },
      }),
      prisma.refund.aggregate({
        where: refundsPaidWhere({ branchId }, from, to),
        _sum: { amountMinor: true },
      }),
      prisma.income.groupBy({
        by: ['categoryId'],
        where: { branchId, receivedOn: range },
        _sum: { amountMinor: true },
      }),
      prisma.expensePayment.findMany({
        where: { paidOn: range, expense: { branchId } },
        select: {
          amountMinor: true,
          expense: { select: { categoryId: true } },
        },
      }),
      prisma.payrollPayment.aggregate({
        where: { paidOn: range, run: { branchId } },
        _sum: { amountMinor: true },
      }),
      prisma.payrollLine.aggregate({
        where: {
          run: {
            branchId,
            month: { gte: from.slice(0, 7), lte: to.slice(0, 7) },
            status: { in: [...PAYROLL_APPROVED] },
          },
        },
        _sum: { deductionsMinor: true },
      }),
    ]);
  const expenseCategoryIds = [
    ...new Set(expensePayments.map((p) => p.expense.categoryId)),
  ];
  const [incomeCategories, expenseCategories] = await Promise.all([
    prisma.incomeCategory.findMany({
      where: { id: { in: incomeGroups.map((g) => g.categoryId) } },
      select: { id: true, name: true },
    }),
    prisma.expenseCategory.findMany({
      where: { id: { in: expenseCategoryIds } },
      select: { id: true, name: true },
    }),
  ]);
  return buildProfitLoss({
    feeReceivedMinor: fees._sum.amountMinor ?? 0n,
    feeRefundedMinor: refunds._sum.amountMinor ?? 0n,
    otherIncome: named(
      incomeGroups.map((g) => ({
        key: g.categoryId,
        amountMinor: g._sum.amountMinor ?? 0n,
      })),
      new Map(incomeCategories.map((c) => [c.id, c.name])),
      'Other income',
    ),
    expensesPaid: named(
      expensePayments.map((p) => ({
        key: p.expense.categoryId,
        amountMinor: p.amountMinor,
      })),
      new Map(expenseCategories.map((c) => [c.id, c.name])),
      'Expense',
    ),
    salariesPaidMinor: salaries._sum.amountMinor ?? 0n,
    withheldMinor: withheld._sum.deductionsMinor ?? 0n,
  });
}
