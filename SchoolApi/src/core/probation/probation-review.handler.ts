import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../generated/prisma/client';
import type { ApprovalHandler } from '../approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../approvals/approval-handler.registry';
import type { HeldAction } from './probation-action';
import { ProbationActionRegistry } from './probation-action.registry';

/** Replays a held probation action as the reviewer when approved. */
@Injectable()
export class ProbationReviewHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'PROBATION_REVIEW' as const;

  constructor(
    private readonly approvals: ApprovalHandlerRegistry,
    private readonly actions: ProbationActionRegistry,
  ) {}

  onModuleInit(): void {
    this.approvals.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const held = request.payload as unknown as HeldAction;
    const decided = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
      select: { decidedById: true },
    });
    await this.actions.get(held.action).apply(
      held.payload,
      {
        performedById: decided?.decidedById ?? request.requestedById,
        onBehalfOfStaffId: held.onBehalfOfStaffId ?? held.staffId,
      },
      tx,
    );
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const held = request.payload as unknown as HeldAction;
    await this.actions.get(held.action).onDiscarded?.(held.payload, tx);
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }
}
