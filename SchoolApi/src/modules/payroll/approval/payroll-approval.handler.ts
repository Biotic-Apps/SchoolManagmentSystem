import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { PayrollFinalizer } from './payroll-finalizer';

export const RUN_ENTITY = 'PayrollRun';
export const LINES_ENTITY = 'PayrollLines';

/** PAYROLL/PayrollRun: the lines approved by the branch approver. */
@Injectable()
export class PayrollRunApprovalHandler
  implements ApprovalHandler, OnModuleInit
{
  readonly type = 'PAYROLL' as const;
  readonly entityType = RUN_ENTITY;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly finalizer: PayrollFinalizer,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.finalizer.tryApprove(tx, request.entityId);
  }

  onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.finalizer.reset(tx, request);
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.finalizer.reset(tx, request);
  }
}

/** PAYROLL/PayrollLines: lines routed to SUPER_ADMIN (approver's own / principal's salary). */
@Injectable()
export class PayrollLinesApprovalHandler
  implements ApprovalHandler, OnModuleInit
{
  readonly type = 'PAYROLL' as const;
  readonly entityType = LINES_ENTITY;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly finalizer: PayrollFinalizer,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const run = await tx.payrollRun.findUnique({
      where: { id: request.entityId },
      select: { pendingApprovalIds: true },
    });
    if (!run) return;
    await tx.payrollRun.update({
      where: { id: request.entityId },
      data: {
        pendingApprovalIds: run.pendingApprovalIds.filter(
          (id) => id !== request.id,
        ),
      },
    });
    await this.finalizer.tryApprove(tx, request.entityId);
  }

  onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.finalizer.reset(tx, request);
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.finalizer.reset(tx, request);
  }
}
