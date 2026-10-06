import { Injectable } from '@nestjs/common';
import type { Section } from '../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';

export interface DiaryActor {
  section: Section;
  helper: boolean;
  /** Subject teacher the supervisor writes for (proxy). */
  onBehalfOfStaffId: string | null;
}

/** Subject teacher / class teacher / helper of the section, or a proxy (X). */
@Injectable()
export class DiaryAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async writer(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    subjectId: string,
  ): Promise<DiaryActor> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });
    if (!section || scope.guardian) throw notFound('Section');
    const helper = user.activeRole === String(RoleKey.HELPER);
    if (scope.canTeach(sectionId, subjectId))
      return { section, helper, onBehalfOfStaffId: null };
    if (
      user.permissions.has('teacherwork.proxy') &&
      scope.canManageBranch({
        id: section.branchId,
        schoolId: section.schoolId,
      })
    ) {
      const teacher = await this.prisma.staffAssignment.findFirst({
        where: { sectionId, subjectId, kind: 'SUBJECT_TEACHER', endedAt: null },
        orderBy: { isSubstitute: 'asc' },
      });
      return { section, helper, onBehalfOfStaffId: teacher?.staffId ?? null };
    }
    throw forbiddenScope('You do not teach this subject in this section');
  }
}
