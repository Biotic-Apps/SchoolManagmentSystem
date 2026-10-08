import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type {
  ClassOverviewDto,
  ClassSetupDto,
} from '../dto/class-overview.dto';
import type { ClassSetupQueryDto } from '../dto/class-setup-query.dto';
import { SchoolDataAccess } from '../school-data-access';
import {
  allocationOf,
  toClassSubjects,
  toOverview,
  toSectionDto,
} from './class-setup.mapper';
import { ClassSetupRepository } from './class-setup.repository';

/** Classes overview cards and the one-screen Class setup (contract §5.2). */
@Injectable()
export class ClassSetupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ClassSetupRepository,
    private readonly access: SchoolDataAccess,
  ) {}

  async overview(
    scope: Scope,
    query: ClassSetupQueryDto,
  ): Promise<ClassOverviewDto[]> {
    const target = await this.target(scope, query);
    const data = await this.repository.load(target);
    return data.classes.map((c) => toOverview(c, data));
  }

  async setup(
    user: AuthUser,
    scope: Scope,
    classId: string,
    query: ClassSetupQueryDto,
  ): Promise<ClassSetupDto> {
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!schoolClass) throw notFound('Class');
    const target = await this.target(scope, query, schoolClass.schoolId);
    const data = await this.repository.load({ ...target, classIds: [classId] });
    const row = data.classes[0];
    const sections = data.sections;
    const managesBranch = scope.canManageBranch({
      id: target.branchId,
      schoolId: target.schoolId,
    });
    const has = (p: string) => user.permissions.has(p);
    return {
      class: {
        id: row.id,
        name: row.name,
        levelOrder: row.levelOrder,
        status: row.status,
      },
      branchId: target.branchId,
      sessionId: target.sessionId,
      sections: sections.map(toSectionDto),
      subjects: toClassSubjects(row),
      allocation: allocationOf(row, sections, data),
      groups: [
        ...new Set(
          sections.map((s) => s.group).filter((g): g is string => !!g),
        ),
      ],
      canEditStructure:
        has('classes.edit') &&
        (await this.access.canManage(scope, target.schoolId)),
      canAllocate:
        (has('timetable.edit') || has('staff.edit')) && managesBranch,
    };
  }

  /** Checklist: active sections and section × subject pairs without a teacher. */
  async allocationGaps(branch: { id: string; schoolId: string }) {
    const session = await this.prisma.academicSession.findFirst({
      where: { branchId: branch.id, status: 'ACTIVE' },
      select: { id: true },
    });
    const data = await this.repository.load({
      schoolId: branch.schoolId,
      branchId: branch.id,
      sessionId: session?.id ?? null,
    });
    const unallocated = data.classes.reduce(
      (n, c) => n + toOverview(c, data).unallocated,
      0,
    );
    return { sections: data.sections.length, unallocated };
  }

  /** Branch (explicit, or the caller's only branch) and session (default ACTIVE). */
  private async target(
    scope: Scope,
    query: ClassSetupQueryDto,
    schoolId?: string,
  ) {
    const branchId = query.branchId ?? this.onlyBranch(scope);
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch || (schoolId && branch.schoolId !== schoolId))
      throw notFound('Branch');
    scope.assertReadBranch(branch);
    const sessionId =
      query.sessionId ??
      (
        await this.prisma.academicSession.findFirst({
          where: { branchId, status: 'ACTIVE' },
          select: { id: true },
        })
      )?.id ??
      null;
    return {
      schoolId: branch.schoolId,
      branchId,
      sessionId,
      sectionIds: scope.sectionLimited ? [...scope.sectionIds] : undefined,
    };
  }

  private onlyBranch(scope: Scope): string {
    const ids = new Set([...scope.branchIds, ...scope.memberBranchIds]);
    if (ids.size === 1) return [...ids][0];
    const message = 'branchId is required';
    throw invalid(message, [message]);
  }
}
