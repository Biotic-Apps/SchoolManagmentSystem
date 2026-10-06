import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';

export const PROMOTION_ENTITY = 'PromotionBatch';

/** PROMOTION approved → CONFIRMED; rejected/returned → back to SUGGESTED. */
@Injectable()
export class PromotionApprovalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'PROMOTION' as const;
  readonly entityType = PROMOTION_ENTITY;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const updated = await tx.promotionDecision.updateMany({
      where: { approvalId: request.id, status: 'SUGGESTED' },
      data: { status: 'CONFIRMED' },
    });
    this.stage(request, 'CONFIRMED', updated.count);
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const updated = await tx.promotionDecision.updateMany({
      where: { approvalId: request.id, status: 'SUGGESTED' },
      data: { approvalId: null },
    });
    this.stage(request, 'SUGGESTED', updated.count);
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }

  private stage(request: ApprovalRequest, status: string, count: number) {
    this.audit.stage({
      action: 'promotion.decision',
      entityType: 'AcademicSession',
      entityId: request.entityId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      after: { approvalId: request.id, status, count },
    });
  }
}
