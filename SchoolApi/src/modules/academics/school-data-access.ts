import { Injectable } from '@nestjs/common';
import { forbiddenScope } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';

/**
 * School-wide academic data (classes, curriculum, subjects): editable by
 * whoever manages the school or one of its branches (changes are audited).
 */
@Injectable()
export class SchoolDataAccess {
  constructor(private readonly prisma: PrismaService) {}

  async canManage(scope: Scope, schoolId: string): Promise<boolean> {
    if (scope.canManageSchool(schoolId)) return true;
    if (scope.branchIds.size === 0) return false;
    const branches = await this.prisma.branch.count({
      where: { schoolId, id: { in: [...scope.branchIds] } },
    });
    return branches > 0;
  }

  async assertManage(scope: Scope, schoolId: string): Promise<void> {
    if (!(await this.canManage(scope, schoolId))) throw forbiddenScope();
  }
}
