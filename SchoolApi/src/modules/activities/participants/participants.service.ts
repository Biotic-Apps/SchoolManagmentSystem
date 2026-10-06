import { Injectable } from '@nestjs/common';
import type { ActivityStatus } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ActivityAccessService } from '../activity-access.service';
import { ActivityAudienceService } from '../activity-audience.service';
import { participantViolations } from '../consent-rule';
import type {
  ParticipantsDto,
  ParticipantsInputDto,
} from '../dto/participant.dto';

const EDITABLE: ActivityStatus[] = ['ANNOUNCED', 'ONGOING', 'COMPLETED'];

/** The participant list (and results); consent gates who may take part. */
@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ActivityAccessService,
    private readonly audiences: ActivityAudienceService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, activityId: string): Promise<ParticipantsDto> {
    await this.access.load(scope, activityId);
    const rows = await this.prisma.activityParticipant.findMany({
      where: {
        activityId,
        ...(scope.guardian ? { studentId: { in: [...scope.studentIds] } } : {}),
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
      orderBy: [
        { position: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'asc' },
      ],
    });
    return {
      participants: rows.map((r) => ({
        studentId: r.studentId,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        role: r.role,
        result: r.result,
        position: r.position,
        remarks: r.remarks,
      })),
    };
  }

  async replace(
    user: AuthUser,
    scope: Scope,
    activityId: string,
    dto: ParticipantsInputDto,
  ): Promise<ParticipantsDto> {
    const activity = await this.access.load(scope, activityId);
    this.access.assertEditor(user, scope, activity);
    if (!EDITABLE.includes(activity.status))
      throw conflict(`Activity is ${activity.status}`);
    const studentIds = dto.participants.map((p) => p.studentId);
    if (new Set(studentIds).size !== studentIds.length)
      throw conflict('A student is listed more than once');
    const consents = await this.prisma.activityConsent.findMany({
      where: { activityId, studentId: { in: studentIds } },
      select: { studentId: true, status: true },
    });
    const violations = participantViolations(studentIds, {
      consentRequired: activity.consentRequired,
      maxParticipants: activity.maxParticipants,
      audience: new Set(await this.audiences.studentIds(activity)),
      consents: new Map(consents.map((c) => [c.studentId, c.status])),
    });
    if (violations.notInAudience.length > 0)
      throw conflict('Students are not in the activity audience', {
        studentIds: violations.notInAudience,
      });
    if (violations.withoutConsent.length > 0)
      throw conflict('Students without granted consent cannot participate', {
        studentIds: violations.withoutConsent,
      });
    if (violations.overCapacity)
      throw conflict(`At most ${activity.maxParticipants} participants`);

    const before = await this.prisma.activityParticipant.count({
      where: { activityId },
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.activityParticipant.deleteMany({ where: { activityId } });
      await tx.activityParticipant.createMany({
        data: dto.participants.map((p) => ({
          activityId,
          studentId: p.studentId,
          role: p.role ?? null,
          result: p.result ?? null,
          position: p.position ?? null,
          remarks: p.remarks ?? null,
        })),
      });
    });
    this.audit.stage({
      action: 'activity.participants',
      entityType: 'Activity',
      entityId: activityId,
      schoolId: activity.schoolId,
      branchId: activity.branchId,
      before: { count: before },
      after: { participants: dto.participants },
    });
    return this.list(scope, activityId);
  }
}
