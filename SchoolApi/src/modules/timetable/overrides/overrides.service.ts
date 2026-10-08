import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate, parseDate } from '../../../core/common/dates';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { isoWeekday } from '../../../core/common/week';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SectionAccessService } from '../../students/section-access.service';
import type {
  CreateOverrideDto,
  OverrideQueryDto,
} from '../dto/timetable-input.dto';
import type { OverrideDto } from '../dto/timetable.dto';
import { PeriodsService } from '../periods/periods.service';

const INCLUDE = {
  originalStaff: { select: { id: true, name: true } },
  substituteStaff: { select: { id: true, name: true, userId: true } },
} satisfies Prisma.TimetableOverrideInclude;

type OverrideRow = Prisma.TimetableOverrideGetPayload<{
  include: typeof INCLUDE;
}>;

const toDto = (row: OverrideRow): OverrideDto => ({
  id: row.id,
  sectionId: row.sectionId,
  date: formatDate(row.date),
  periodIndex: row.periodIndex,
  originalStaff: row.originalStaff,
  substituteStaff: {
    id: row.substituteStaff.id,
    name: row.substituteStaff.name,
  },
  reason: row.reason,
  createdAt: row.createdAt.toISOString(),
});

/** Day substitutions (backendFlows.md §5) that notify the substitute. */
@Injectable()
export class OverridesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionAccessService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
  ) {}

  async list(scope: Scope, query: OverrideQueryDto): Promise<OverrideDto[]> {
    const rows = await this.prisma.timetableOverride.findMany({
      where: {
        AND: [
          scope.global
            ? {}
            : scope.sectionLimited
              ? scope.sectionFilter()
              : scope.branchFilter(),
          {
            branchId: query.branchId,
            date: query.date ? parseDate(query.date) : undefined,
            cancelledAt: null,
          },
        ],
      },
      include: INCLUDE,
      orderBy: [{ date: 'asc' }, { periodIndex: 'asc' }],
      take: 500,
    });
    return rows.map(toDto);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateOverrideDto,
  ): Promise<OverrideDto> {
    const section = await this.sections.read(scope, dto.sectionId);
    scope.assertManageBranch({
      id: section.branchId,
      schoolId: section.schoolId,
    });
    const date = parseDate(dto.date);
    const dayRows = await this.periods.forDay(
      section.branchId,
      isoWeekday(date),
    );
    const period = dayRows.find((p) => p.index === dto.periodIndex);
    if (!period || period.isBreak)
      throw invalid(
        `Period ${dto.periodIndex} is not a teaching period on ${dto.date}`,
      );
    const slot = await this.prisma.timetableSlot.findFirst({
      where: {
        published: true,
        day: isoWeekday(date),
        periodIndex: dto.periodIndex,
        timetable: { sectionId: section.id, sessionId: section.sessionId },
      },
    });
    if (!slot) throw invalid('No published lesson in that period');
    const substitute = await this.prisma.staff.findUnique({
      where: { id: dto.substituteStaffId },
    });
    if (
      !substitute ||
      substitute.schoolId !== section.schoolId ||
      substitute.status !== 'ACTIVE'
    )
      throw invalid('Substitute must be an active staff member of the school');
    if (substitute.id === slot.staffId)
      throw invalid('Substitute is the regular teacher');

    const row = await this.prisma.timetableOverride
      .create({
        data: {
          schoolId: section.schoolId,
          branchId: section.branchId,
          sectionId: section.id,
          date,
          periodIndex: dto.periodIndex,
          originalStaffId: slot.staffId,
          substituteStaffId: substitute.id,
          reason: dto.reason,
          createdById: user.id,
        },
        include: INCLUDE,
      })
      .catch((error: { code?: string }) => {
        if (error.code === 'P2002')
          throw conflict('That period already has a substitute');
        throw error;
      });
    if (row.substituteStaff.userId) {
      await this.notifications.notify({
        userIds: [row.substituteStaff.userId],
        category: 'TIMETABLE',
        title: 'Substitution assigned',
        body: `You cover period ${dto.periodIndex} on ${dto.date}.`,
        data: { overrideId: row.id, sectionId: section.id },
      });
    }
    return this.audited('timetable.override_create', row);
  }

  async cancel(user: AuthUser, scope: Scope, id: string): Promise<OverrideDto> {
    const row = await this.prisma.timetableOverride.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!row || row.cancelledAt) throw notFound('Override');
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    const updated = await this.prisma.timetableOverride.update({
      where: { id },
      data: { cancelledAt: new Date() },
      include: INCLUDE,
    });
    return this.audited('timetable.override_cancel', updated);
  }

  private audited(action: string, row: OverrideRow): OverrideDto {
    const dto = toDto(row);
    this.audit.stage({
      action,
      entityType: 'TimetableOverride',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: dto,
    });
    return dto;
  }
}
