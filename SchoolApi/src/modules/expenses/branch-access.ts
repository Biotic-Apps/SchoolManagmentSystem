import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';

export interface BranchInfo {
  id: string;
  schoolId: string;
  code: string;
  name: string;
}

/** Loads branches/schools of finance records and checks the caller's scope. */
@Injectable()
export class BranchAccess {
  constructor(private readonly prisma: PrismaService) {}

  async find(branchId: string): Promise<BranchInfo> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, schoolId: true, code: true, name: true },
    });
    if (!branch) throw notFound('Branch');
    return branch;
  }

  /** Branch the caller manages (403 FORBIDDEN_SCOPE otherwise). */
  async manage(scope: Scope, branchId: string): Promise<BranchInfo> {
    const branch = await this.find(branchId);
    scope.assertManageBranch(branch);
    return branch;
  }

  async read(scope: Scope, branchId: string): Promise<BranchInfo> {
    const branch = await this.find(branchId);
    scope.assertReadBranch(branch);
    return branch;
  }

  /**
   * School of a school-wide record (vendors, categories, items): explicit
   * `schoolId`, else the branch's school, else the caller's only school.
   */
  async school(
    scope: Scope,
    ref: { schoolId?: string; branchId?: string },
  ): Promise<string> {
    if (ref.branchId) {
      const branch = await this.read(scope, ref.branchId);
      if (ref.schoolId && ref.schoolId !== branch.schoolId) {
        throw invalid('branchId is not in schoolId');
      }
      return branch.schoolId;
    }
    if (ref.schoolId) {
      scope.assertReadSchool(ref.schoolId);
      return ref.schoolId;
    }
    const schools = new Set([...scope.schoolIds, ...scope.memberSchoolIds]);
    if (!scope.global && schools.size === 1) return [...schools][0];
    throw invalid('schoolId is required');
  }
}
