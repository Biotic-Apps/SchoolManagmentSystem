import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  audienceFilter,
  audienceIncludes,
  readAudience,
  type StudentPlace,
} from './activity-audience';
import { PUBLIC_STATUSES } from './activity-status';
import { ACTIVITY_INCLUDE, type ActivityRow } from './activity.mapper';

/** Who may see or change an activity. */
@Injectable()
export class ActivityAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async places(studentIds: string[]): Promise<Map<string, StudentPlace>> {
    const rows = await this.prisma.enrollment.findMany({
      where: { studentId: { in: studentIds }, status: 'ACTIVE' },
      select: {
        studentId: true,
        branchId: true,
        sectionId: true,
        section: { select: { classId: true } },
      },
    });
    return new Map(
      rows.map((r) => [
        r.studentId,
        {
          branchId: r.branchId,
          sectionId: r.sectionId,
          classId: r.section.classId,
        },
      ]),
    );
  }

  /** Parents: public activities reaching the children; staff: readable branches. */
  async visibleFilter(
    scope: Scope,
    studentIds: string[] = [...scope.studentIds],
  ): Promise<Prisma.ActivityWhereInput> {
    if (!scope.guardian) return scope.branchFilter();
    const places = [...(await this.places(studentIds)).values()];
    if (places.length === 0) return { id: { in: [] } };
    return { status: { in: PUBLIC_STATUSES }, ...audienceFilter(places) };
  }

  /** Loads a visible activity: 404 for parents, 403 for staff outside scope. */
  async load(scope: Scope, id: string): Promise<ActivityRow> {
    const row = await this.prisma.activity.findUnique({
      where: { id },
      include: ACTIVITY_INCLUDE,
    });
    if (!row) throw notFound('Activity');
    if (scope.guardian) {
      if (!PUBLIC_STATUSES.includes(row.status)) throw notFound('Activity');
      const places = await this.places([...scope.studentIds]);
      const audience = readAudience(row.audience);
      const reaches = [...places.values()].some((p) =>
        audienceIncludes(audience, row.branchId, p),
      );
      if (!reaches) throw notFound('Activity');
      return row;
    }
    if (!scope.canReadBranch({ id: row.branchId, schoolId: row.schoolId }))
      throw forbiddenScope();
    return row;
  }

  canManage(scope: Scope, row: { branchId: string; schoolId: string }) {
    return scope.canManageBranch({ id: row.branchId, schoolId: row.schoolId });
  }

  /** The proposer or branch management may change the activity. */
  assertEditor(
    user: AuthUser,
    scope: Scope,
    row: { branchId: string; schoolId: string; proposedById: string },
  ): void {
    if (row.proposedById !== user.id && !this.canManage(scope, row))
      throw forbiddenScope('Only the proposer or branch management');
  }
}
