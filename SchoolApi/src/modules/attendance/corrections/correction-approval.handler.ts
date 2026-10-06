import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';

/** ATTENDANCE_CORRECTION: applies the new status; the old one stays in history. */
@Injectable()
export class CorrectionApprovalHandler
  implements ApprovalHandler, OnModuleInit
{
  readonly type = 'ATTENDANCE_CORRECTION' as const;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const correction = await tx.attendanceCorrection.update({
      where: { id: request.entityId },
      data: { status: 'APPROVED', decidedAt: new Date() },
    });
    await tx.attendanceEntry.update({
      where: { id: correction.entryId },
      data: { status: correction.newStatus },
    });
    this.audit.stage({
      action: 'attendance.correction_apply',
      entityType: 'AttendanceEntry',
      entityId: correction.entryId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      before: { status: correction.oldStatus },
      after: { status: correction.newStatus, correctionId: correction.id },
    });
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.attendanceCorrection.update({
      where: { id: request.entityId },
      data: { status: 'REJECTED', decidedAt: new Date() },
    });
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }
}
