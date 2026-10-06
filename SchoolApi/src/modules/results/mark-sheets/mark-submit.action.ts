import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type {
  ApplyContext,
  ProbationActionHandler,
} from '../../../core/probation/probation-action';
import { ProbationActionRegistry } from '../../../core/probation/probation-action.registry';

export const MARKS_SUBMIT_ACTION = 'exams.marks.submit';

export interface MarksSubmitPayload {
  sheetId: string;
}

/** Submits a mark sheet now, or after the probation reviewer approves (P). */
@Injectable()
export class MarkSubmitAction
  implements ProbationActionHandler<MarksSubmitPayload>, OnModuleInit
{
  readonly key = MARKS_SUBMIT_ACTION;

  constructor(
    private readonly registry: ProbationActionRegistry,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async apply(
    payload: MarksSubmitPayload,
    context: ApplyContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const sheet = await tx.markSheet.findUniqueOrThrow({
      where: { id: payload.sheetId },
    });
    if (!['NOT_ENTERED', 'DRAFT', 'RETURNED'].includes(sheet.status))
      throw conflict('The mark sheet cannot be submitted now');
    await tx.markSheet.update({
      where: { id: sheet.id },
      data: {
        status: 'SUBMITTED',
        submittedById: context.performedById,
        submittedAt: new Date(),
        onBehalfOfStaffId: context.onBehalfOfStaffId,
        approvalId: null,
        version: { increment: 1 },
      },
    });
    this.audit.stage({
      action: 'marks.submit',
      entityType: 'MarkSheet',
      entityId: sheet.id,
      schoolId: sheet.schoolId,
      branchId: sheet.branchId,
      actorId: context.performedById,
      onBehalfOfStaffId: context.onBehalfOfStaffId ?? undefined,
      before: { status: sheet.status },
      after: { status: 'SUBMITTED' },
    });
  }

  async onHeld(
    payload: MarksSubmitPayload,
    approvalId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.markSheet.update({
      where: { id: payload.sheetId },
      data: { approvalId },
    });
  }

  async onDiscarded(
    payload: MarksSubmitPayload,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.markSheet.update({
      where: { id: payload.sheetId },
      data: { status: 'RETURNED', approvalId: null },
    });
  }
}
