import { Injectable, OnModuleInit } from '@nestjs/common';
import type {
  ApprovalRequest,
  Prisma,
  PurchaseRequestStatus,
} from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';
import { PURCHASE_REQUEST_ENTITY } from './purchase-requests.service';

/** PURCHASE_ORDER: PENDING → APPROVED | REJECTED (returned counts as rejected). */
@Injectable()
export class PurchaseRequestApprovalHandler
  implements ApprovalHandler, OnModuleInit
{
  readonly type = 'PURCHASE_ORDER' as const;
  readonly entityType = PURCHASE_REQUEST_ENTITY;

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
    status: PurchaseRequestStatus,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const updated = await tx.purchaseRequest.updateMany({
      where: { id: request.entityId, status: 'PENDING' },
      data: { status, decidedAt: new Date() },
    });
    if (updated.count === 0) return;
    this.audit.stage({
      action: `purchase_request.${status.toLowerCase()}`,
      entityType: PURCHASE_REQUEST_ENTITY,
      entityId: request.entityId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      before: { status: 'PENDING' },
      after: { status, approvalId: request.id },
    });
  }
}
