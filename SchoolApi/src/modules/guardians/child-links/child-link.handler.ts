import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AccessCache } from '../../../core/rbac/access/access-cache';
import type { ChildLinkPayload } from './child-link-request.service';

/** CHILD_LINK approval: VERIFIED grants the parent access at once. */
@Injectable()
export class ChildLinkHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'CHILD_LINK' as const;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly accessCache: AccessCache,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const payload = request.payload as unknown as ChildLinkPayload;
    const decided = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    await tx.studentGuardian.update({
      where: { id: payload.linkId },
      data: {
        status: 'VERIFIED',
        verifiedById: decided?.decidedById,
        verifiedAt: new Date(),
      },
    });
    await this.close(tx, payload, 'VERIFIED');
    await this.accessCache.invalidateUser(request.requestedById);
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const payload = request.payload as unknown as ChildLinkPayload;
    await tx.studentGuardian.update({
      where: { id: payload.linkId },
      data: { status: 'REJECTED' },
    });
    await this.close(tx, payload, 'REJECTED');
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }

  private async close(
    tx: Prisma.TransactionClient,
    payload: ChildLinkPayload,
    status: 'VERIFIED' | 'REJECTED',
  ): Promise<void> {
    await tx.childLinkRequest.update({
      where: { id: payload.requestId },
      data: { status, decidedAt: new Date() },
    });
  }
}
