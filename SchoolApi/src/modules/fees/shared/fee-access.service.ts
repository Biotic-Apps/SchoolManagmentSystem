import { Injectable } from '@nestjs/common';
import {
  forbidden,
  forbiddenScope,
  notFound,
} from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { fullName } from '../../students/student.mapper';

export interface FeeStudent {
  studentId: string;
  name: string;
  admissionNo: string;
  schoolId: string;
  /** Branch of the latest enrollment (any status). */
  branchId: string | null;
  /** Active enrollment, when there is one. */
  active: {
    sessionId: string;
    sectionId: string;
    classId: string;
    branchId: string;
  } | null;
}

/** Scope checks for finance data of a student and of branches. */
@Injectable()
export class FeeAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async student(studentId: string): Promise<FeeStudent | null> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        schoolId: true,
        firstName: true,
        lastName: true,
        admissionNo: true,
        enrollments: {
          select: {
            status: true,
            branchId: true,
            sessionId: true,
            sectionId: true,
            section: { select: { classId: true } },
          },
          orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
    if (!student) return null;
    const active = student.enrollments.find((e) => e.status === 'ACTIVE');
    return {
      studentId: student.id,
      name: fullName(student),
      admissionNo: student.admissionNo,
      schoolId: student.schoolId,
      branchId: active?.branchId ?? student.enrollments[0]?.branchId ?? null,
      active: active
        ? {
            sessionId: active.sessionId,
            sectionId: active.sectionId,
            classId: active.section.classId,
            branchId: active.branchId,
          }
        : null,
    };
  }

  /** Read: parents only their children (404), staff their readable branches (403). */
  async readStudent(scope: Scope, studentId: string): Promise<FeeStudent> {
    if (scope.guardian && !scope.canAccessStudent(studentId))
      throw notFound('Student');
    const student = await this.student(studentId);
    if (!student) throw notFound('Student');
    if (scope.guardian) return student;
    const allowed = student.branchId
      ? scope.canReadBranch({
          id: student.branchId,
          schoolId: student.schoolId,
        })
      : scope.canManageSchool(student.schoolId);
    if (!allowed) throw forbiddenScope();
    return student;
  }

  /** Write: staff managing the student's branch; parents are refused. */
  async manageStudent(scope: Scope, studentId: string): Promise<FeeStudent> {
    if (scope.guardian) throw forbidden('Only school staff can do this');
    const student = await this.student(studentId);
    if (!student) throw notFound('Student');
    const branchId = student.active?.branchId ?? student.branchId;
    if (branchId) {
      scope.assertManageBranch({ id: branchId, schoolId: student.schoolId });
    } else {
      scope.assertManageSchool(student.schoolId);
    }
    return student;
  }

  async branch(id: string): Promise<{ id: string; schoolId: string }> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!branch) throw notFound('Branch');
    return branch;
  }

  async readBranch(scope: Scope, id: string) {
    const branch = await this.branch(id);
    if (scope.guardian) throw forbidden('Not available to parents');
    scope.assertReadBranch(branch);
    return branch;
  }

  async manageBranch(scope: Scope, id: string) {
    const branch = await this.branch(id);
    if (scope.guardian) throw forbidden('Not available to parents');
    scope.assertManageBranch(branch);
    return branch;
  }
}
