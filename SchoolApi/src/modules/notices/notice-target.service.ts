import { Injectable } from '@nestjs/common';
import { forbiddenScope, invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  hasTargets,
  normalizeNoticeAudience,
  type NoticeAudience,
} from './notice-audience';
import type { NoticeAudienceInputDto } from './dto/notice-input.dto';

export interface NoticeOrigin {
  schoolId: string;
  branchId: string | null;
  audience: NoticeAudience;
}

/** Checks that the author may address every target; derives school/branch. */
@Injectable()
export class NoticeTargetService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    user: AuthUser,
    scope: Scope,
    input: NoticeAudienceInputDto,
  ): Promise<NoticeOrigin> {
    const audience = normalizeNoticeAudience(input);
    if (!hasTargets(audience))
      throw invalid(
        'Audience needs schoolWide, branchIds, classIds, sectionIds or guardianIds',
      );
    const schools = new Set<string>();
    const branches = new Set<string>();
    await this.checkBranches(scope, audience, schools, branches);
    await this.checkSections(scope, audience, schools, branches);
    await this.checkClasses(scope, audience, schools);
    await this.checkGuardians(scope, audience, schools);

    if (schools.size > 1) throw invalid('All targets must be in one school');
    const home = await this.home(user);
    const schoolId = [...schools][0] ?? home.schoolId;
    if (!schoolId) throw invalid('Cannot determine the school of the notice');
    if (audience.schoolWide) {
      if (!scope.canManageSchool(schoolId))
        throw forbiddenScope('School-wide notices need school scope');
      return { schoolId, branchId: null, audience };
    }
    let branchId: string | null = null;
    if (branches.size === 1) branchId = [...branches][0];
    else if (branches.size === 0 && home.schoolId === schoolId)
      branchId = home.branchId;
    return { schoolId, branchId, audience };
  }

  private async checkBranches(
    scope: Scope,
    audience: NoticeAudience,
    schools: Set<string>,
    branches: Set<string>,
  ) {
    if (audience.branchIds.length === 0) return;
    const rows = await this.prisma.branch.findMany({
      where: { id: { in: audience.branchIds } },
      select: { id: true, schoolId: true },
    });
    if (rows.length !== audience.branchIds.length)
      throw invalid('Some branches were not found');
    for (const b of rows) {
      if (!scope.canReadBranch(b)) throw forbiddenScope();
      schools.add(b.schoolId);
      branches.add(b.id);
    }
  }

  private async checkSections(
    scope: Scope,
    audience: NoticeAudience,
    schools: Set<string>,
    branches: Set<string>,
  ) {
    if (audience.sectionIds.length === 0) return;
    const rows = await this.prisma.section.findMany({
      where: { id: { in: audience.sectionIds } },
      select: { id: true, schoolId: true, branchId: true },
    });
    if (rows.length !== audience.sectionIds.length)
      throw invalid('Some sections were not found');
    for (const s of rows) {
      if (!scope.canReadSection(s)) throw forbiddenScope();
      schools.add(s.schoolId);
      branches.add(s.branchId);
    }
  }

  private async checkClasses(
    scope: Scope,
    audience: NoticeAudience,
    schools: Set<string>,
  ) {
    if (audience.classIds.length === 0) return;
    if (scope.sectionLimited)
      throw forbiddenScope('Teachers may only address their own sections');
    const rows = await this.prisma.schoolClass.findMany({
      where: { id: { in: audience.classIds } },
      select: { schoolId: true },
    });
    if (rows.length !== audience.classIds.length)
      throw invalid('Some classes were not found');
    for (const c of rows) {
      if (!scope.canReadSchool(c.schoolId)) throw forbiddenScope();
      schools.add(c.schoolId);
    }
  }

  private async checkGuardians(
    scope: Scope,
    audience: NoticeAudience,
    schools: Set<string>,
  ) {
    if (audience.guardianIds.length === 0) return;
    const rows = await this.prisma.guardian.findMany({
      where: { id: { in: audience.guardianIds } },
      select: { id: true, schoolId: true },
    });
    if (rows.length !== audience.guardianIds.length)
      throw invalid('Some guardians were not found');
    for (const g of rows) {
      if (!scope.canReadSchool(g.schoolId)) throw forbiddenScope();
      schools.add(g.schoolId);
    }
    if (!scope.sectionLimited) return;
    const reachable = await this.prisma.guardian.count({
      where: {
        id: { in: audience.guardianIds },
        studentLinks: {
          some: {
            status: 'VERIFIED',
            student: {
              enrollments: {
                some: {
                  status: 'ACTIVE',
                  sectionId: { in: [...scope.sectionIds] },
                },
              },
            },
          },
        },
      },
    });
    if (reachable !== audience.guardianIds.length)
      throw forbiddenScope('Guardians must belong to your sections');
  }

  /** The author's own school/branch (staff record, else first assignment). */
  private async home(
    user: AuthUser,
  ): Promise<{ schoolId: string | null; branchId: string | null }> {
    const staff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
      select: { schoolId: true, branchId: true },
    });
    if (staff) return staff;
    const assignment =
      user.assignments.find((a) => a.branchId) ??
      user.assignments.find((a) => a.schoolId);
    return {
      schoolId: assignment?.schoolId ?? null,
      branchId: assignment?.branchId ?? null,
    };
  }
}
