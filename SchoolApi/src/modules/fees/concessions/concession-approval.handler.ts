import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';

/** CONCESSION: records the decision; only invoices generated later apply it. */
@Injectable()
export class ConcessionApprovalHandler
  implements ApprovalHandler, OnModuleInit
{
  readonly type = 'CONCESSION' as const;
  readonly entityType = 'Concession';

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
    return this.decide(request, 'REJECTED', tx);
  }

  private async decide(
    request: ApprovalRequest,
    status: 'APPROVED' | 'REJECTED',
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const step = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    const concession = await tx.concession.update({
      where: { id: request.entityId },
      data: { status, decidedAt: new Date() },
    });
    this.audit.stage({
      action: `concession.${status.toLowerCase()}`,
      entityType: 'Concession',
      entityId: concession.id,
      schoolId: concession.schoolId,
      branchId: concession.branchId,
      actorId: step?.decidedById ?? undefined,
      after: { status, comment: step?.comment ?? null },
    });
  }
}
