import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict } from '../../core/common/errors/errors';
import type {
  ApplyContext,
  ProbationActionHandler,
} from '../../core/probation/probation-action';
import { ProbationActionRegistry } from '../../core/probation/probation-action.registry';
import { DiaryPublisher } from './diary-publisher';

export const DIARY_PUBLISH_ACTION = 'diary.publish';

export interface DiaryPublishPayload {
  entryId: string;
}

/** Publishes now, or after the probation reviewer approves (P). */
@Injectable()
export class DiaryPublishAction
  implements ProbationActionHandler<DiaryPublishPayload>, OnModuleInit
{
  readonly key = DIARY_PUBLISH_ACTION;

  constructor(
    private readonly registry: ProbationActionRegistry,
    private readonly publisher: DiaryPublisher,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async apply(
    payload: DiaryPublishPayload,
    context: ApplyContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const entry = await tx.diaryEntry.findUniqueOrThrow({
      where: { id: payload.entryId },
    });
    if (!['DRAFT', 'RETURNED', 'PENDING_REVIEW'].includes(entry.status))
      throw conflict('The diary entry cannot be published now');
    await this.publisher.publish(tx, entry.id, context.performedById);
    this.audit.stage({
      action: 'diary.publish',
      entityType: 'DiaryEntry',
      entityId: entry.id,
      schoolId: entry.schoolId,
      branchId: entry.branchId,
      actorId: context.performedById,
      onBehalfOfStaffId: entry.onBehalfOfStaffId ?? undefined,
      before: { status: entry.status },
      after: { status: 'PUBLISHED' },
    });
  }

  async onHeld(
    payload: DiaryPublishPayload,
    approvalId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.diaryEntry.update({
      where: { id: payload.entryId },
      data: { status: 'PENDING_REVIEW', approvalId },
    });
  }

  async onDiscarded(
    payload: DiaryPublishPayload,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.diaryEntry.update({
      where: { id: payload.entryId },
      data: { status: 'RETURNED' },
    });
  }
}
