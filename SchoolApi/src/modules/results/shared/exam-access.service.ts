import { Injectable } from '@nestjs/common';
import type { Exam } from '../../../generated/prisma/client';
import { notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';

const examBranch = (exam: Exam) => ({
  id: exam.branchId,
  schoolId: exam.schoolId,
});

/** Loads an exam and checks the caller's reach. */
@Injectable()
export class ExamAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async load(id: string): Promise<Exam> {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw notFound('Exam');
    return exam;
  }

  /** Branch management scope (coordinator, principal, admins). */
  async manage(scope: Scope, id: string): Promise<Exam> {
    const exam = await this.load(id);
    if (scope.guardian) throw notFound('Exam');
    scope.assertManageBranch(examBranch(exam));
    return exam;
  }

  /** Staff of the branch; parents only PUBLISHED exams of their children's branches. */
  async read(scope: Scope, id: string): Promise<Exam> {
    const exam = await this.load(id);
    if (scope.guardian) {
      const branches = await this.childBranchIds(scope);
      if (exam.status !== 'PUBLISHED' || !branches.includes(exam.branchId))
        throw notFound('Exam');
      return exam;
    }
    scope.assertReadBranch(examBranch(exam));
    return exam;
  }

  canManage(scope: Scope, exam: Exam): boolean {
    return !scope.guardian && scope.canManageBranch(examBranch(exam));
  }

  async childBranchIds(scope: Scope): Promise<string[]> {
    const rows = await this.prisma.enrollment.findMany({
      where: { studentId: { in: [...scope.studentIds] } },
      select: { branchId: true },
      distinct: ['branchId'],
    });
    return rows.map((r) => r.branchId);
  }
}
