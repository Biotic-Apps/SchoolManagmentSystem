import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { parseDate } from '../../../core/common/dates';
import { forbidden } from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { OPEN_STATUSES } from '../../finance-core/invoice-state';
import { periodEnd, periodStart } from '../../finance-core/period';
import { FinanceAccess } from '../shared/finance-access';
import { collectionRate } from './collection-rate';
import type {
  FinanceDashboardDto,
  FinanceDashboardQueryDto,
} from './dto/finance-dashboard.dto';

type BranchWhere =
  { branchId: string } | ReturnType<Scope['managedBranchFilter']>;

const PAYROLL_COUNTED = [
  'APPROVED',
  'PARTIALLY_PAID',
  'PAID',
  'CLOSED',
] as const;
const EXPENSE_COUNTED = ['APPROVED', 'PARTIALLY_PAID', 'PAID'] as const;

/** `GET /dashboard/finance` (contract G): month figures for managed branches. */
@Injectable()
export class FinanceDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
  ) {}

  async get(
    scope: Scope,
    query: FinanceDashboardQueryDto,
  ): Promise<FinanceDashboardDto> {
    if (scope.guardian) throw forbidden();
    let branch: BranchWhere = scope.managedBranchFilter();
    if (query.branchId) {
      await this.access.managedBranch(scope, query.branchId);
      branch = { branchId: query.branchId };
    }
    const today = schoolDate();
    const month = query.month ?? today.slice(0, 7);
    const range = { gte: periodStart(month), lte: periodEnd(month) };
    const live = { not: 'REVERSED' } as const;

    const [billed, collected, open, overdue, expenses, payroll, todays] =
      await Promise.all([
        this.prisma.invoice.aggregate({
          where: {
            AND: [branch],
            status: { notIn: ['DRAFT', 'CANCELLED'] },
            OR: [{ period: month }, { period: null, issueDate: range }],
          },
          _sum: { totalMinor: true },
        }),
        this.sumPayments({ AND: [branch], status: live, receivedOn: range }),
        this.openBalance({ AND: [branch], status: { in: OPEN_STATUSES } }),
        this.openBalance({ AND: [branch], status: 'OVERDUE' }),
        this.prisma.expense.aggregate({
          where: {
            AND: [branch],
            billDate: range,
            status: { in: [...EXPENSE_COUNTED] },
          },
          _sum: { amountMinor: true },
        }),
        this.prisma.payrollLine.aggregate({
          where: {
            run: {
              AND: [branch],
              month,
              status: { in: [...PAYROLL_COUNTED] },
            },
          },
          _sum: { netMinor: true },
        }),
        this.sumPayments({
          AND: [branch],
          status: live,
          receivedOn: parseDate(today),
        }),
      ]);
    const billedMinor = billed._sum.totalMinor ?? 0n;
    return {
      branchId: query.branchId ?? null,
      month,
      billedMinor: Number(billedMinor),
      collectedMinor: Number(collected),
      outstandingMinor: Number(open),
      overdueMinor: Number(overdue),
      collectionRate: collectionRate(collected, billedMinor),
      expensesMinor: Number(expenses._sum.amountMinor ?? 0n),
      payrollMinor: Number(payroll._sum.netMinor ?? 0n),
      todayCollectedMinor: Number(todays),
      currency: 'PKR',
    };
  }

  private async sumPayments(where: Prisma.PaymentWhereInput): Promise<bigint> {
    const result = await this.prisma.payment.aggregate({
      where,
      _sum: { amountMinor: true },
    });
    return result._sum.amountMinor ?? 0n;
  }

  private async openBalance(where: Prisma.InvoiceWhereInput): Promise<bigint> {
    const result = await this.prisma.invoice.aggregate({
      where,
      _sum: { totalMinor: true, paidMinor: true },
    });
    return (result._sum.totalMinor ?? 0n) - (result._sum.paidMinor ?? 0n);
  }
}
