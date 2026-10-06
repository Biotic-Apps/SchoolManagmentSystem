import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../generated/prisma/client';
import type { ApprovalHandler } from '../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../core/approvals/approval-handler.registry';
import { AuditService } from '../../core/audit/audit.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { ActivityAudienceService } from './activity-audience.service';

/** ACTIVITY: approve announces it (and asks for consent); reject closes it. */
@Injectable()
export class ActivityApprovalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'ACTIVITY' as const;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly audiences: ActivityAudienceService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const activity = await tx.activity.findUnique({
      where: { id: request.entityId },
    });
    if (!activity || activity.status !== 'PROPOSED') return;
    const decision = await this.decision(request.id, tx);
    await tx.activity.update({
      where: { id: activity.id },
      data: {
        status: 'ANNOUNCED',
        decidedById: decision.decidedById,
        decidedAt: new Date(),
      },
    });
    const studentIds = await this.audiences.studentIds(activity, tx);
    if (activity.consentRequired && studentIds.length > 0) {
      const guardians = await this.audiences.primaryGuardians(studentIds, tx);
      await tx.activityConsent.createMany({
        data: studentIds.map((studentId) => ({
          activityId: activity.id,
          studentId,
          guardianId: guardians.get(studentId) ?? null,
        })),
        skipDuplicates: true,
      });
    }
    this.audit.stage({
      action: 'activity.approve',
      entityType: 'Activity',
      entityId: activity.id,
      schoolId: activity.schoolId,
      branchId: activity.branchId,
      actorId: decision.decidedById ?? undefined,
      before: { status: activity.status },
      after: { status: 'ANNOUNCED', consentRows: studentIds.length },
    });
    const userIds = await this.people.guardianUserIds(studentIds);
    await this.notifications.notify({
      userIds,
      category: activity.consentRequired ? 'CONSENT' : 'ACTIVITY',
      title: activity.consentRequired
        ? `Consent needed: ${activity.title}`
        : `New activity: ${activity.title}`,
      body: activity.consentRequired
        ? 'Please grant or decline consent for your child.'
        : activity.description.slice(0, 200),
      data: {
        activityId: activity.id,
        consentRequired: activity.consentRequired,
      },
    });
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const activity = await tx.activity.findUnique({
      where: { id: request.entityId },
    });
    if (!activity || activity.status !== 'PROPOSED') return;
    const decision = await this.decision(request.id, tx);
    await tx.activity.update({
      where: { id: activity.id },
      data: {
        status: 'REJECTED',
        reason: decision.comment,
        decidedById: decision.decidedById,
        decidedAt: new Date(),
      },
    });
    this.audit.stage({
      action: 'activity.reject',
      entityType: 'Activity',
      entityId: activity.id,
      schoolId: activity.schoolId,
      branchId: activity.branchId,
      actorId: decision.decidedById ?? undefined,
      before: { status: activity.status },
      after: { status: 'REJECTED', reason: decision.comment },
    });
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }

  private async decision(requestId: string, tx: Prisma.TransactionClient) {
    const step = await tx.approvalStep.findFirst({
      where: { requestId, decidedById: { not: null } },
      orderBy: { order: 'desc' },
      select: { decidedById: true, comment: true },
    });
    return {
      decidedById: step?.decidedById ?? null,
      comment: step?.comment ?? null,
    };
  }
}
