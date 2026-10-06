import { Injectable, OnModuleInit } from '@nestjs/common';
import type {
  ApprovalRequest,
  ExpenseStatus,
  Prisma,
} from '../../generated/prisma/client';
import type { ApprovalHandler } from '../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../core/approvals/approval-handler.registry';
import { AuditService } from '../../core/audit/audit.service';
import { EXPENSE_ENTITY } from './expense-submission';

/** EXPENSE: SUBMITTED → APPROVED | REJECTED (returned → back to DRAFT). */
@Injectable()
export class ExpenseApprovalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'EXPENSE' as const;
  readonly entityType = EXPENSE_ENTITY;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApproved(request: ApprovalRequest, tx: Prisma.TransactionClient) {
    return this.decide(request, 'APPROVED', tx);
  }

  onRejected(request: ApprovalRequest, tx: Prisma.TransactionClient) {
    return this.decide(request, 'REJECTED', tx);
  }

  onReturned(request: ApprovalRequest, tx: Prisma.TransactionClient) {
    return this.decide(request, 'DRAFT', tx);
  }

  private async decide(
    request: ApprovalRequest,
    status: ExpenseStatus,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const updated = await tx.expense.updateMany({
      where: { id: request.entityId, status: 'SUBMITTED' },
      data: { status },
    });
    if (updated.count === 0) return;
    this.audit.stage({
      action: `expense.${status.toLowerCase()}`,
      entityType: EXPENSE_ENTITY,
      entityId: request.entityId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      before: { status: 'SUBMITTED' },
      after: { status, approvalId: request.id },
    });
  }
}
