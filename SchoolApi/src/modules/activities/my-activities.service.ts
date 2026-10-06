import { Injectable } from '@nestjs/common';
import { forbidden, notFound } from '../../core/common/errors/errors';
import { today } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { ActivityAccessService } from './activity-access.service';
import { ACTIVITY_INCLUDE, toActivityDto } from './activity.mapper';
import type { MyActivitiesDto } from './dto/activity.dto';

/** Parent view of one child: what is coming up and what awaits consent. */
@Injectable()
export class MyActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ActivityAccessService,
  ) {}

  async forChild(scope: Scope, studentId: string): Promise<MyActivitiesDto> {
    if (!scope.guardian) throw forbidden('Only parents have this view');
    if (!scope.canAccessStudent(studentId)) throw notFound('Student');
    const visible = await this.access.visibleFilter(scope, [studentId]);
    const rows = await this.prisma.activity.findMany({
      where: {
        AND: [
          visible,
          { status: { in: ['ANNOUNCED', 'ONGOING'] } },
          { endAt: { gte: new Date() } },
        ],
      },
      include: {
        ...ACTIVITY_INCLUDE,
        consents: { where: { studentId }, select: { status: true } },
      },
      orderBy: { startAt: 'asc' },
      take: 100,
    });
    const now = today();
    const items = rows.map((row) => ({
      row,
      consent: row.consents[0]?.status ?? null,
    }));
    const pending = items.filter(
      ({ row, consent }) =>
        row.status === 'ANNOUNCED' &&
        row.consentRequired &&
        consent !== 'GRANTED' &&
        consent !== 'DECLINED' &&
        (!row.consentDeadline || row.consentDeadline >= now),
    );
    return {
      upcoming: items.map(({ row, consent }) => toActivityDto(row, consent)),
      consentPending: pending.map(({ row, consent }) =>
        toActivityDto(row, consent),
      ),
    };
  }
}
