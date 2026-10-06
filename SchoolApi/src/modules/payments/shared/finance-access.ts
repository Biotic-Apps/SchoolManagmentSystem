import { Injectable } from '@nestjs/common';
import type { Branch } from '../../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';

export interface StudentRecordRef {
  studentId: string;
  schoolId: string;
  branchId: string;
}

export interface PayingStudent {
  id: string;
  name: string;
  admissionNo: string;
  schoolId: string;
  branchId: string;
}

/** Scope checks shared by payments, proofs, refunds and collections. */
@Injectable()
export class FinanceAccess {
  constructor(private readonly prisma: PrismaService) {}

  async managedBranch(scope: Scope, branchId: string): Promise<Branch> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw notFound('Branch');
    scope.assertManageBranch(branch);
    return branch;
  }

  /** Parents: own child else 404; staff: managed branch else 403. */
  assertRecord(scope: Scope, record: StudentRecordRef, entity: string): void {
    if (scope.guardian) {
      if (!scope.canAccessStudent(record.studentId)) throw notFound(entity);
      return;
    }
    if (
      !scope.canManageBranch({ id: record.branchId, schoolId: record.schoolId })
    )
      throw forbiddenScope();
  }

  /**
   * The student's branch from the latest enrollment (any status, so
   * withdrawn or graduated students can still clear their dues).
   */
  async payingStudent(studentId: string): Promise<PayingStudent | null> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNo: true },
        },
      },
    });
    if (!enrollment) return null;
    return {
      id: studentId,
      name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      admissionNo: enrollment.student.admissionNo,
      schoolId: enrollment.schoolId,
      branchId: enrollment.branchId,
    };
  }
}
