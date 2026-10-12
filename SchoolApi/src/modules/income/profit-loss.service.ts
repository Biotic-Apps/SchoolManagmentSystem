import { Injectable } from '@nestjs/common';
import { parseDate } from '../../core/common/dates';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchAccess } from '../expenses/branch-access';

export interface ProfitLossLineDto {
  section: string;
  item: string;
  amountMinor: number;
}

export interface ProfitLossDto {
  from: string;
  to: string;
  branchId: string;
  totalIncomeMinor: number;
  totalExpensesMinor: number;
  netMinor: number;
  lines: ProfitLossLineDto[];
}

interface ProfitLossQuery {
  branchId: string;
  from: string;
  to: string;
}

@Injectable()
export class ProfitLossService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
  ) {}

  async generate(
    scope: Scope,
    query: ProfitLossQuery,
  ): Promise<ProfitLossDto> {
    await this.access.manage(scope, query.branchId);
    const { branchId, from, to } = query;
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    const fromMonth = from.slice(0, 7);
    const toMonth = to.slice(0, 7);

    const [feeCollections, otherIncomeGroups, expenseGroups, payrollRuns] =
      await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            branchId,
            status: { not: 'REVERSED' },
            receivedOn: { gte: fromDate, lte: toDate },
          },
          _sum: { amountMinor: true },
        }),
        this.prisma.income.groupBy({
          by: ['categoryId'],
          where: {
            branchId,
            receivedOn: { gte: fromDate, lte: toDate },
          },
          _sum: { amountMinor: true },
        }),
        this.prisma.expense.groupBy({
          by: ['categoryId'],
          where: {
            branchId,
            status: { notIn: ['DRAFT', 'REJECTED'] },
            billDate: { gte: fromDate, lte: toDate },
          },
          _sum: { amountMinor: true },
        }),
        this.prisma.payrollRun.findMany({
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

    const [incomeCategories, expenseCategories] = await Promise.all([
      this.prisma.incomeCategory.findMany({
        where: {
          id: { in: otherIncomeGroups.map((g) => g.categoryId) },
        },
        select: { id: true, name: true },
      }),
      this.prisma.expenseCategory.findMany({
        where: {
          id: { in: expenseGroups.map((g) => g.categoryId) },
        },
        select: { id: true, name: true },
      }),
    ]);
    const incomeCatName = new Map(
      incomeCategories.map((c) => [c.id, c.name]),
    );
    const expenseCatName = new Map(
      expenseCategories.map((c) => [c.id, c.name]),
    );

    const lines: ProfitLossLineDto[] = [];

    // Income
    const feeTotal = feeCollections._sum.amountMinor ?? 0n;
    lines.push({
      section: 'INCOME',
      item: 'Fee collections',
      amountMinor: Number(feeTotal),
    });

    let otherIncomeTotal = 0n;
    for (const g of otherIncomeGroups) {
      const amt = g._sum.amountMinor ?? 0n;
      otherIncomeTotal += amt;
      lines.push({
        section: 'INCOME',
        item: incomeCatName.get(g.categoryId) ?? 'Other income',
        amountMinor: Number(amt),
      });
    }

    const totalIncome = feeTotal + otherIncomeTotal;

    // Expenses
    let expenseTotal = 0n;
    for (const g of expenseGroups) {
      const amt = g._sum.amountMinor ?? 0n;
      expenseTotal += amt;
      lines.push({
        section: 'EXPENSE',
        item: expenseCatName.get(g.categoryId) ?? 'Expense',
        amountMinor: Number(amt),
      });
    }

    let payrollTotal = 0n;
    for (const run of payrollRuns) {
      const runNet = run.lines.reduce((sum, line) => sum + line.netMinor, 0n);
      payrollTotal += runNet;
      lines.push({
        section: 'EXPENSE',
        item: `Payroll — ${run.month}`,
        amountMinor: Number(runNet),
      });
    }

    const totalExpenses = expenseTotal + payrollTotal;

    return {
      from,
      to,
      branchId,
      totalIncomeMinor: Number(totalIncome),
      totalExpensesMinor: Number(totalExpenses),
      netMinor: Number(totalIncome - totalExpenses),
      lines,
    };
  }
}
