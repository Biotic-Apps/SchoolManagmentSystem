import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../generated/prisma/client';
import type { ApprovalHandler } from '../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../core/approvals/approval-handler.registry';
import { AuditService } from '../../core/audit/audit.service';
import { LeaveAutofill } from './leave-autofill';

/** LEAVE: records the decision (the engine notifies) and fills attendance on approval. */
@Injectable()
export class LeaveApprovalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'LEAVE' as const;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly autofill: LeaveAutofill,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const leave = await this.decide(request, 'APPROVED', tx);
    await this.autofill.apply(leave, tx, leave.decidedById);
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.decide(request, 'REJECTED', tx);
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }

  private async decide(
    request: ApprovalRequest,
    status: 'APPROVED' | 'REJECTED',
    tx: Prisma.TransactionClient,
  ) {
    const step = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    const leave = await tx.leaveRequest.update({
      where: { id: request.entityId },
      data: {
        status,
        decidedById: step?.decidedById ?? null,
        decidedAt: new Date(),
        comment: step?.comment ?? null,
      },
    });
    this.audit.stage({
      action: `leave.${status.toLowerCase()}`,
      entityType: 'LeaveRequest',
      entityId: leave.id,
      schoolId: leave.schoolId,
      branchId: leave.branchId,
      actorId: step?.decidedById ?? undefined,
      after: { status, comment: leave.comment },
    });
    return leave;
  }
}
