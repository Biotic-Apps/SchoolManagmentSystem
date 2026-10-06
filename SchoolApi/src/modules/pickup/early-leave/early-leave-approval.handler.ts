import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate } from '../../../core/common/dates';
import { NotificationService } from '../../../core/notifications/notification.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';

export const EARLY_LEAVE_ENTITY = 'EarlyLeave';

/** EARLY_LEAVE: records the decision on the request and tells the family. */
@Injectable()
export class EarlyLeaveApprovalHandler
  implements ApprovalHandler, OnModuleInit
{
  readonly type = 'EARLY_LEAVE' as const;
  readonly entityType = EARLY_LEAVE_ENTITY;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.apply(request, tx, 'APPROVED');
  }

  onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.apply(request, tx, 'REJECTED');
  }

  private async apply(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
    status: 'APPROVED' | 'REJECTED',
  ): Promise<void> {
    const step = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    const updated = await tx.earlyLeave.updateMany({
      where: { id: request.entityId, status: 'REQUESTED' },
      data: {
        status,
        decidedById: step?.decidedById ?? null,
        decidedAt: step?.decidedAt ?? new Date(),
        comment: step?.comment ?? null,
      },
    });
    if (updated.count === 0) return;
    const leave = await tx.earlyLeave.findUniqueOrThrow({
      where: { id: request.entityId },
      include: { student: { select: { firstName: true, lastName: true } } },
    });
    this.audit.stage({
      action: `pickup.early_leave_${status.toLowerCase()}`,
      entityType: EARLY_LEAVE_ENTITY,
      entityId: leave.id,
      schoolId: leave.schoolId,
      branchId: leave.branchId,
      before: { status: 'REQUESTED' },
      after: { status, comment: leave.comment },
    });
    const guardians = await this.people.guardianUserIds([leave.studentId]);
    const name = `${leave.student.firstName} ${leave.student.lastName}`;
    await this.notifications.notify({
      userIds: [leave.requestedById, ...guardians],
      category: 'PICKUP',
      title: `Early leave ${status.toLowerCase()}: ${name}`,
      body:
        leave.comment ??
        `${formatDate(leave.date)} ${leave.time} early leave was ${status.toLowerCase()}.`,
      data: { earlyLeaveId: leave.id, studentId: leave.studentId },
    });
  }
}
