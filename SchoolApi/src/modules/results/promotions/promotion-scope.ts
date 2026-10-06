import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';

/** Branch and session checks shared by the promotion endpoints. */
@Injectable()
export class PromotionScope {
  constructor(private readonly prisma: PrismaService) {}

  private async branch(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!branch) throw notFound('Branch');
    return branch;
  }

  async managedBranch(scope: Scope, id: string) {
    if (scope.guardian) throw notFound('Branch');
    const branch = await this.branch(id);
    scope.assertManageBranch(branch);
    return branch;
  }

  /** Staff of the branch; parents filtered to their children by the caller. */
  async readableBranch(scope: Scope, id: string) {
    const branch = await this.branch(id);
    if (!scope.guardian) scope.assertReadBranch(branch);
    return branch;
  }

  async assertSessions(branchId: string, ids: string[]): Promise<void> {
    const found = await this.prisma.academicSession.count({
      where: { id: { in: ids }, branchId },
    });
    if (found !== new Set(ids).size)
      throw invalid('Sessions not found in this branch');
  }
}
