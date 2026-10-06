import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict } from '../../core/common/errors/errors';
import type {
  ApplyContext,
  ProbationActionHandler,
} from '../../core/probation/probation-action';
import { ProbationActionRegistry } from '../../core/probation/probation-action.registry';
import { AbsenceNotifier } from './absence-notifier';
import { RegisterWriter } from './register-writer';
import { RegistersRepository } from './registers.repository';

export const REGISTER_SUBMIT_ACTION = 'attendance.submit';

export interface RegisterSubmitPayload {
  registerId: string;
  userId: string;
  onBehalfOfStaffId: string | null;
}

/** Submits a register now, or when a probation review is approved. */
@Injectable()
export class RegisterSubmitAction
  implements ProbationActionHandler<RegisterSubmitPayload>, OnModuleInit
{
  readonly key = REGISTER_SUBMIT_ACTION;

  constructor(
    private readonly registry: ProbationActionRegistry,
    private readonly repository: RegistersRepository,
    private readonly writer: RegisterWriter,
    private readonly absences: AbsenceNotifier,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async apply(
    payload: RegisterSubmitPayload,
    context: ApplyContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const row = await tx.attendanceRegister.findUniqueOrThrow({
      where: { id: payload.registerId },
    });
    const locked = await this.repository.lock(tx, row.sectionId, row.date);
    if (!locked || locked.status === 'LOCKED')
      throw conflict('The register can no longer be submitted');
    const roster = await this.repository.roster(row.sectionId, tx);
    const ids = roster.map((s) => s.studentId);
    const leave = await this.repository.onLeave(ids, row.date, tx);
    await this.writer.submit(
      tx,
      row.id,
      {
        userId: payload.userId,
        onBehalfOfStaffId: payload.onBehalfOfStaffId,
      },
      leave,
      ids,
    );
    this.audit.stage({
      action: 'attendance.submit',
      entityType: 'AttendanceRegister',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      actorId: context.performedById,
      onBehalfOfStaffId: payload.onBehalfOfStaffId ?? undefined,
      before: { status: locked.status },
      after: { status: 'SUBMITTED', submittedById: payload.userId },
    });
    await this.absences.notify(row.id, tx);
  }

  async onHeld(
    payload: RegisterSubmitPayload,
    approvalId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.attendanceRegister.update({
      where: { id: payload.registerId },
      data: { status: 'PENDING_REVIEW', pendingApprovalId: approvalId },
    });
  }

  async onDiscarded(
    payload: RegisterSubmitPayload,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.attendanceRegister.update({
      where: { id: payload.registerId },
      data: { status: 'DRAFT', pendingApprovalId: null },
    });
  }
}
