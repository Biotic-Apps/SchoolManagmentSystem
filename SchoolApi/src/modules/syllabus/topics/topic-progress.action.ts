import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Prisma, TopicStatus } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import type {
  ApplyContext,
  ProbationActionHandler,
} from '../../../core/probation/probation-action';
import { ProbationActionRegistry } from '../../../core/probation/probation-action.registry';

export const TOPIC_PROGRESS_ACTION = 'syllabus.topicProgress';

export interface TopicProgressPayload {
  topicId: string;
  status: TopicStatus;
  completedOn: string | null;
  note: string | null;
}

/** Applies topic progress now, or on PROBATION_REVIEW approval. */
@Injectable()
export class TopicProgressAction
  implements ProbationActionHandler<TopicProgressPayload>, OnModuleInit
{
  readonly key = TOPIC_PROGRESS_ACTION;

  constructor(
    private readonly registry: ProbationActionRegistry,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async apply(
    payload: TopicProgressPayload,
    context: ApplyContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const before = await tx.syllabusTopic.findUniqueOrThrow({
      where: { id: payload.topicId },
      include: { plan: { select: { schoolId: true, branchId: true } } },
    });
    await tx.syllabusTopic.update({
      where: { id: payload.topicId },
      data: {
        status: payload.status,
        completedOn: payload.completedOn
          ? parseDate(payload.completedOn)
          : null,
        note: payload.note,
        updatedById: context.performedById,
        onBehalfOfStaffId: context.onBehalfOfStaffId,
        pendingApprovalId: null,
      },
    });
    this.audit.stage({
      action: 'syllabus.topic_progress',
      entityType: 'SyllabusTopic',
      entityId: payload.topicId,
      schoolId: before.plan.schoolId,
      branchId: before.plan.branchId,
      actorId: context.performedById,
      onBehalfOfStaffId: context.onBehalfOfStaffId ?? undefined,
      before: { status: before.status, completedOn: before.completedOn },
      after: payload,
    });
  }

  async onHeld(
    payload: TopicProgressPayload,
    approvalId: string,
    tx: Prisma.TransactionClient,
  ) {
    await tx.syllabusTopic.update({
      where: { id: payload.topicId },
      data: { pendingApprovalId: approvalId },
    });
  }

  async onDiscarded(
    payload: TopicProgressPayload,
    tx: Prisma.TransactionClient,
  ) {
    await tx.syllabusTopic.update({
      where: { id: payload.topicId },
      data: { pendingApprovalId: null },
    });
  }
}
