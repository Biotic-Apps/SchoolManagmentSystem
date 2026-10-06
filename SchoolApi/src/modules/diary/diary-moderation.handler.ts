import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../generated/prisma/client';
import type { ApprovalHandler } from '../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../core/approvals/approval-handler.registry';
import { DiaryPublisher } from './diary-publisher';

/** DIARY_MODERATION: approve publishes; reject/return sends it back with the comment. */
@Injectable()
export class DiaryModerationHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'DIARY_MODERATION' as const;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly publisher: DiaryPublisher,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const step = await this.lastStep(request, tx);
    await this.publisher.publish(
      tx,
      request.entityId,
      step?.decidedById ?? request.requestedById,
    );
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const step = await this.lastStep(request, tx);
    await tx.diaryEntry.update({
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

  private lastStep(request: ApprovalRequest, tx: Prisma.TransactionClient) {
    return tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
  }
}
