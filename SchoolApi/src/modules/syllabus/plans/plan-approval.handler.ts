import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';

/** SYLLABUS_PLAN: approve publishes the plan; reject/return sends it back. */
@Injectable()
export class PlanApprovalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'SYLLABUS_PLAN' as const;

  constructor(private readonly registry: ApprovalHandlerRegistry) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.syllabusPlan.update({
      where: { id: request.entityId },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const step = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    await tx.syllabusPlan.update({
      where: { id: request.entityId },
      data: { status: 'RETURNED', comment: step?.comment ?? null },
    });
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }
}
