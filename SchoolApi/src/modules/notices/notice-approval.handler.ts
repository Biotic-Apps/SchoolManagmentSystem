import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../generated/prisma/client';
import type { ApprovalHandler } from '../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../core/approvals/approval-handler.registry';
import { AuditService } from '../../core/audit/audit.service';
import { NoticePublisher } from './notice-publisher.service';

/** NOTICE: approve publishes the teacher's notice; reject keeps the comment. */
@Injectable()
export class NoticeApprovalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'NOTICE' as const;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly publisher: NoticePublisher,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const notice = await tx.notice.findUnique({
      where: { id: request.entityId },
    });
    if (notice?.status !== 'PENDING_APPROVAL') return;
    const step = await this.lastStep(request.id, tx);
    const recipients = await this.publisher.publish(
      notice.id,
      step?.decidedById ?? request.requestedById,
      tx,
    );
    this.audit.stage({
      action: 'notice.publish',
      entityType: 'Notice',
      entityId: notice.id,
      schoolId: notice.schoolId,
      branchId: notice.branchId,
      actorId: step?.decidedById ?? undefined,
      before: { status: notice.status },
      after: { status: 'PUBLISHED', recipients },
    });
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const notice = await tx.notice.findUnique({
      where: { id: request.entityId },
    });
    if (notice?.status !== 'PENDING_APPROVAL') return;
    const step = await this.lastStep(request.id, tx);
    await tx.notice.update({
      where: { id: notice.id },
      data: { status: 'REJECTED', comment: step?.comment ?? null },
    });
    this.audit.stage({
      action: 'notice.reject',
      entityType: 'Notice',
      entityId: notice.id,
      schoolId: notice.schoolId,
      branchId: notice.branchId,
      actorId: step?.decidedById ?? undefined,
      before: { status: notice.status },
      after: { status: 'REJECTED', comment: step?.comment ?? null },
    });
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }

  private lastStep(requestId: string, tx: Prisma.TransactionClient) {
    return tx.approvalStep.findFirst({
      where: { requestId, decidedById: { not: null } },
      orderBy: { order: 'desc' },
      select: { decidedById: true, comment: true },
    });
  }
}
