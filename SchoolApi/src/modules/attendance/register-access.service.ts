import { Injectable } from '@nestjs/common';
import type { Section } from '../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../school-day/school-people.service';

export interface RegisterActor {
  section: Section;
  /** Set when a supervisor marks for the class teacher (proxy). */
  onBehalfOfStaffId: string | null;
  helper: boolean;
}

/** Who may read or mark a section's register (contract §1, (H)(X)). */
@Injectable()
export class RegisterAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
  ) {}

  async readable(scope: Scope, sectionId: string): Promise<Section> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });
    if (!section || scope.guardian) throw notFound('Section');
    scope.assertReadSection(section, 'Section');
    return section;
  }

  async writer(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<RegisterActor> {
    const section = await this.readable(scope, sectionId);
    const helper = user.activeRole === String(RoleKey.HELPER);
    if (scope.classSectionIds.has(section.id)) {
      return { section, onBehalfOfStaffId: null, helper };
    }
    if (
      user.permissions.has('teacherwork.proxy') &&
      scope.canManageBranch({
        id: section.branchId,
        schoolId: section.schoolId,
      })
    ) {
      const teacher = await this.people.classTeacher(section.id);
      return { section, onBehalfOfStaffId: teacher?.staffId ?? null, helper };
    }
    throw forbiddenScope('You do not take attendance for this section');
  }
}
