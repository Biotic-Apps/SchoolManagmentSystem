import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../core/approvals/approval.service';
import { conflict, forbiddenScope } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { NotificationService } from '../../core/notifications/notification.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { ActivitiesService } from './activities.service';
import { ActivityAccessService } from './activity-access.service';
import { ActivityAudienceService } from './activity-audience.service';
import { canMoveTo } from './activity-status';
import { ACTIVITY_INCLUDE, toActivityDto } from './activity.mapper';
import type { ActivityStatusDto } from './dto/activity-input.dto';
import type { ActivityDto } from './dto/activity.dto';

/** Approve/reject (principal) and the ANNOUNCED → COMPLETED/CANCELLED flow. */
@Injectable()
export class ActivityLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ActivityAccessService,
    private readonly activities: ActivitiesService,
    private readonly audiences: ActivityAudienceService,
    private readonly approvals: ApprovalService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
  ) {}

  async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    comment?: string,
  ): Promise<ActivityDto> {
    const row = await this.access.load(scope, id);
    if (!this.access.canManage(scope, row)) throw forbiddenScope();
    if (row.status !== 'PROPOSED' || !row.approvalId)
      throw conflict('Activity is not awaiting approval');
    await this.approvals.decideAuthorized(user.id, row.approvalId, {
      decision,
      comment,
    });
    const updated = await this.prisma.activity.findUniqueOrThrow({
      where: { id },
      include: ACTIVITY_INCLUDE,
    });
    return toActivityDto(updated);
  }

  async setStatus(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ActivityStatusDto,
  ): Promise<ActivityDto> {
    const row = await this.access.load(scope, id);
    this.access.assertEditor(user, scope, row);
    if (!canMoveTo(row.status, dto.status))
      throw conflict(
        `Cannot move activity from ${row.status} to ${dto.status}`,
      );
    await this.prisma.activity.update({
      where: { id },
      data: {
        status: dto.status,
        reason: dto.reason ?? (dto.status === 'CANCELLED' ? null : undefined),
      },
    });
    const wasPublic = row.status === 'ANNOUNCED' || row.status === 'ONGOING';
    if (dto.status === 'CANCELLED' && wasPublic) {
      const studentIds = await this.audiences.studentIds(row);
      await this.notifications.notify({
        userIds: await this.people.guardianUserIds(studentIds),
        category: 'ACTIVITY',
        title: `Cancelled: ${row.title}`,
        body: dto.reason ?? 'The activity has been cancelled.',
        data: { activityId: id },
      });
    }
    return this.activities.done(
      `activity.${dto.status.toLowerCase()}`,
      id,
      toActivityDto(row),
    );
  }
}
