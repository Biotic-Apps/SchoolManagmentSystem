import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import type {
  ApplyContext,
  ProbationActionHandler,
} from '../../core/probation/probation-action';
import { ProbationActionRegistry } from '../../core/probation/probation-action.registry';
import { MessageDelivery } from './message-delivery.service';

export const MESSAGE_SEND_ACTION = 'messages.send';

export interface MessageSendPayload {
  messageId: string;
}

/** Sends a held staff message once a probation reviewer approves it. */
@Injectable()
export class MessageSendAction
  implements ProbationActionHandler<MessageSendPayload>, OnModuleInit
{
  readonly key = MESSAGE_SEND_ACTION;

  constructor(
    private readonly registry: ProbationActionRegistry,
    private readonly delivery: MessageDelivery,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async apply(
    payload: MessageSendPayload,
    context: ApplyContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const result = await this.delivery.deliver(payload.messageId, tx);
    const message = await tx.message.findUniqueOrThrow({
      where: { id: payload.messageId },
      select: { thread: { select: { schoolId: true, branchId: true } } },
    });
    this.audit.stage({
      action: 'messages.send',
      entityType: 'Message',
      entityId: payload.messageId,
      schoolId: message.thread.schoolId,
      branchId: message.thread.branchId,
      actorId: context.performedById,
      onBehalfOfStaffId: context.onBehalfOfStaffId ?? undefined,
      after: { status: 'SENT', ...result },
    });
  }

  async onHeld(
    payload: MessageSendPayload,
    approvalId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.message.update({
      where: { id: payload.messageId },
      data: { pendingApprovalId: approvalId },
    });
  }

  async onDiscarded(
    payload: MessageSendPayload,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.message.update({
      where: { id: payload.messageId },
      data: { status: 'REJECTED', pendingApprovalId: null },
    });
  }
}
