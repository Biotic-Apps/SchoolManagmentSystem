import { Injectable } from '@nestjs/common';
import { invalid } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { ReportParams } from './report-params';

export interface ReportTarget {
  schoolId: string;
  branchId: string | null;
}

/**
 * Resolves what a report covers and checks management scope over it before
 * anything is queued (403 FORBIDDEN_SCOPE outside, 400 for unknown ids).
 */
@Injectable()
export class ReportScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(scope: Scope, params: ReportParams): Promise<ReportTarget> {
    if (typeof params.examId === 'string') {
      const exam = await this.prisma.exam.findUnique({
        where: { id: params.examId },
        select: { schoolId: true, branchId: true },
      });
      if (!exam) throw invalid('Unknown exam', { param: 'examId' });
      return this.branch(scope, exam.branchId, exam.schoolId);
    }
    if (typeof params.branchId === 'string') {
      const branch = await this.prisma.branch.findUnique({
        where: { id: params.branchId },
        select: { id: true, schoolId: true },
      });
      if (!branch) throw invalid('Unknown branch', { param: 'branchId' });
      return this.branch(scope, branch.id, branch.schoolId);
    }
    if (typeof params.schoolId === 'string') {
      const school = await this.prisma.school.findUnique({
        where: { id: params.schoolId },
        select: { id: true },
      });
      if (!school) throw invalid('Unknown school', { param: 'schoolId' });
      scope.assertManageSchool(school.id);
      return { schoolId: school.id, branchId: null };
    }
    throw invalid('Report has no target');
  }

  private branch(
    scope: Scope,
    branchId: string,
    schoolId: string,
  ): ReportTarget {
    scope.assertManageBranch({ id: branchId, schoolId });
    return { schoolId, branchId };
  }
}
