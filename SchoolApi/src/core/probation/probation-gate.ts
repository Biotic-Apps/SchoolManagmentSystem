import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../approvals/approval.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoleKey } from '../rbac/role-key.enum';
import type {
  GateResult,
  HeldAction,
  ReviewableAction,
} from './probation-action';
import { ProbationActionRegistry } from './probation-action.registry';

export interface GateActor {
  userId: string;
  /** Set when a supervisor works for a teacher (proxy). */
  onBehalfOfStaffId?: string | null;
}

/**
 * contract §8: when the acting teacher's staff record `requiresReview`, the
 * action is held as a PROBATION_REVIEW approval routed to their reviewer;
 * otherwise it applies right away.
 */
@Injectable()
export class ProbationGate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
    private readonly registry: ProbationActionRegistry,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async run<T, P>(
    actor: GateActor,
    action: ReviewableAction<P>,
    applyNow: () => Promise<T>,
  ): Promise<GateResult<T>> {
    const staff = await this.prisma.staff.findUnique({
      where: { userId: actor.userId },
      select: { id: true, requiresReview: true, reviewerUserId: true },
    });
    if (!staff?.requiresReview) {
      return { status: 'APPLIED', approvalId: null, result: await applyNow() };
    }

    const handler = this.registry.get(action.key);
    const held: HeldAction<P> = {
      action: action.key,
      payload: action.payload,
      staffId: staff.id,
      onBehalfOfStaffId: actor.onBehalfOfStaffId ?? staff.id,
    };
    const reviewer = staff.reviewerUserId;
    const approval = await this.prisma.$transaction(async (tx) => {
      const created = await this.approvals.create(
        {
          type: 'PROBATION_REVIEW',
          entityType: action.entityType,
          entityId: action.entityId,
          schoolId: action.schoolId,
          branchId: action.branchId,
          requestedById: actor.userId,
          title: action.title,
          payload: held,
          steps: [
            reviewer
              ? { approverUserId: reviewer }
              : { approverRole: RoleKey.PRINCIPAL },
          ],
        },
        tx,
      );
      await handler.onHeld?.(action.payload, created.id, tx);
      return created;
    });

    this.audit.stage({
      action: 'probation.hold',
      entityType: action.entityType,
      entityId: action.entityId,
      schoolId: action.schoolId,
      branchId: action.branchId,
      onBehalfOfStaffId: held.onBehalfOfStaffId ?? undefined,
      after: {
        approvalId: approval.id,
        action: action.key,
        payload: action.payload,
      },
    });
    if (reviewer) {
      await this.notifications.notify({
        userIds: [reviewer],
        category: 'APPROVAL',
        title: 'Review needed',
        body: action.title,
        data: { approvalId: approval.id },
      });
    }
    return { status: 'PENDING_REVIEW', approvalId: approval.id, result: null };
  }
}
