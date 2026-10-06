import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { conflict } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { ExpensePaymentInputDto } from './dto/expense-input.dto';
import type { ExpenseDto } from './dto/expense.dto';
import { ExpenseReader } from './expense-reader';
import {
  applyExpensePayment,
  EDITABLE_STATUSES,
  PAYABLE_STATUSES,
} from './expense-rules';
import { ExpenseSubmission } from './expense-submission';

/** Submit for approval and record (partial) payments. */
@Injectable()
export class ExpenseActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reader: ExpenseReader,
    private readonly submission: ExpenseSubmission,
    private readonly audit: AuditService,
  ) {}

  async submit(user: AuthUser, scope: Scope, id: string): Promise<ExpenseDto> {
    await this.reader.findManaged(scope, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM expenses WHERE id = ${id}::uuid FOR UPDATE`;
      const expense = await tx.expense.findUniqueOrThrow({ where: { id } });
      if (!EDITABLE_STATUSES.includes(expense.status)) {
        throw conflict(`Expense is already ${expense.status}`);
      }
      await this.submission.submit(tx, user, expense);
    });
    return this.reader.viewById(id);
  }

  async pay(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ExpensePaymentInputDto,
  ): Promise<ExpenseDto> {
    await this.reader.findManaged(scope, id);
    const payment = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM expenses WHERE id = ${id}::uuid FOR UPDATE`;
      const expense = await tx.expense.findUniqueOrThrow({ where: { id } });
      if (!PAYABLE_STATUSES.includes(expense.status)) {
        throw conflict(
          `Expense is ${expense.status}; only approved bills can be paid`,
        );
      }
      const outcome = applyExpensePayment(
        expense.amountMinor,
        expense.paidMinor,
        BigInt(dto.amountMinor),
      );
      const row = await tx.expensePayment.create({
        data: {
          expenseId: id,
          amountMinor: BigInt(dto.amountMinor),
          method: dto.method,
          reference: dto.reference?.trim() || null,
          paidOn: parseDate(dto.paidOn),
          paidById: user.id,
        },
      });
      await tx.expense.update({
        where: { id },
        data: { paidMinor: outcome.paidMinor, status: outcome.status },
      });
      this.audit.stage({
        action: 'expense.payment',
        entityType: 'Expense',
        entityId: id,
        schoolId: expense.schoolId,
        branchId: expense.branchId,
        before: {
          paidMinor: Number(expense.paidMinor),
          status: expense.status,
        },
        after: {
          paymentId: row.id,
          amountMinor: dto.amountMinor,
          method: dto.method,
          paidMinor: Number(outcome.paidMinor),
          status: outcome.status,
        },
      });
      return row;
    });
    return this.reader.viewById(payment.expenseId);
  }
}
