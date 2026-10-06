import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ActivityAccessService } from '../activity-access.service';
import { ActivityAudienceService } from '../activity-audience.service';
import type {
  ConsentDecisionDto,
  ConsentItemDto,
  ConsentListDto,
} from '../dto/consent.dto';

const CONSENT_INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true } },
  guardian: { select: { id: true, name: true } },
} satisfies Prisma.ActivityConsentInclude;

type ConsentRow = Prisma.ActivityConsentGetPayload<{
  include: typeof CONSENT_INCLUDE;
}>;

const toItem = (row: ConsentRow): ConsentItemDto => ({
  student: {
    id: row.student.id,
    name: `${row.student.firstName} ${row.student.lastName}`,
  },
  guardian: row.guardian,
  status: row.status,
  note: row.note,
  respondedAt: row.respondedAt?.toISOString() ?? null,
});

/** Per-student consent: staff see the sheet, parents answer for their child. */
@Injectable()
export class ConsentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ActivityAccessService,
    private readonly audiences: ActivityAudienceService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, activityId: string): Promise<ConsentListDto> {
    if (scope.guardian) throw forbidden('Consent sheets are for staff');
    await this.access.load(scope, activityId);
    const rows = await this.prisma.activityConsent.findMany({
      where: { activityId },
      include: CONSENT_INCLUDE,
      orderBy: [
        { student: { firstName: 'asc' } },
        { student: { lastName: 'asc' } },
      ],
    });
    const count = (s: string) => rows.filter((r) => r.status === s).length;
    return {
      items: rows.map(toItem),
      counts: {
        pending: count('PENDING'),
        granted: count('GRANTED'),
        declined: count('DECLINED'),
      },
    };
  }

  async respond(
    user: AuthUser,
    scope: Scope,
    activityId: string,
    dto: ConsentDecisionDto,
  ): Promise<ConsentItemDto> {
    if (!scope.guardian) throw forbidden('Only parents can answer consent');
    if (!scope.canAccessStudent(dto.studentId)) throw notFound('Student');
    const activity = await this.access.load(scope, activityId);
    if (!activity.consentRequired)
      throw conflict('This activity does not need consent');
    if (activity.status !== 'ANNOUNCED')
      throw conflict(`Activity is ${activity.status}`);
    if (activity.consentDeadline && today() > activity.consentDeadline)
      throw conflict('The consent deadline has passed');
    const audience = await this.audiences.studentIds(activity);
    if (!audience.includes(dto.studentId))
      throw conflict('The student is not in the activity audience');
    const guardian = await this.prisma.guardian.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    const before = await this.prisma.activityConsent.findUnique({
      where: {
        activityId_studentId: { activityId, studentId: dto.studentId },
      },
    });
    const data = {
      status: dto.decision,
      note: dto.note ?? null,
      guardianId: guardian?.id ?? before?.guardianId ?? null,
      respondedById: user.id,
      respondedAt: new Date(),
    };
    const row = await this.prisma.activityConsent.upsert({
      where: {
        activityId_studentId: { activityId, studentId: dto.studentId },
      },
      create: { activityId, studentId: dto.studentId, ...data },
      update: data,
      include: CONSENT_INCLUDE,
    });
    this.audit.stage({
      action: 'activity.consent',
      entityType: 'ActivityConsent',
      entityId: row.id,
      schoolId: activity.schoolId,
      branchId: activity.branchId,
      before: before ? { status: before.status } : undefined,
      after: { status: row.status, studentId: dto.studentId },
    });
    return toItem(row);
  }
}
