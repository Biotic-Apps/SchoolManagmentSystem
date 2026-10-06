import { Injectable } from '@nestjs/common';
import type { Expense, Prisma } from '../../generated/prisma/client';
import { ApprovalService } from '../../core/approvals/approval.service';
import { AuditService } from '../../core/audit/audit.service';
import type { AuthUser } from '../../core/common/types/auth-user';
import { ApprovalRouting } from '../finance-core/approval-routing';
import { formatMinor } from '../finance-core/money';

export const EXPENSE_ENTITY = 'Expense';

/**
 * Sends an expense for approval (`EXPENSE`, amount-limited steps) inside the
 * caller's transaction; the expense must already be DRAFT/REJECTED or new.
 */
@Injectable()
export class ExpenseSubmission {
  constructor(
    private readonly approvals: ApprovalService,
    private readonly routing: ApprovalRouting,
    private readonly audit: AuditService,
  ) {}

  async submit(
    tx: Prisma.TransactionClient,
    user: AuthUser,
    expense: Expense,
  ): Promise<void> {
    const steps = await this.routing.steps(
      expense.branchId,
      'EXPENSE',
      user.activeRole,
    );
    const approval = await this.approvals.create(
      {
        type: 'EXPENSE',
        entityType: EXPENSE_ENTITY,
        entityId: expense.id,
        schoolId: expense.schoolId,
        branchId: expense.branchId,
        requestedById: user.id,
        title: `Expense: ${expense.title} (${formatMinor(expense.amountMinor, expense.currency)})`,
        payload: {
          expenseId: expense.id,
          title: expense.title,
          amountMinor: Number(expense.amountMinor),
          vendorId: expense.vendorId,
          categoryId: expense.categoryId,
          purchaseOrderId: expense.purchaseOrderId,
        },
        amountMinor: expense.amountMinor,
        steps,
      },
      tx,
    );
    await tx.expense.update({
      where: { id: expense.id },
      data: { status: 'SUBMITTED', approvalId: approval.id },
    });
    this.audit.stage({
      action: 'expense.submit',
      entityType: EXPENSE_ENTITY,
      entityId: expense.id,
      schoolId: expense.schoolId,
      branchId: expense.branchId,
      before: { status: expense.status },
      after: { status: 'SUBMITTED', approvalId: approval.id },
    });
  }
}
