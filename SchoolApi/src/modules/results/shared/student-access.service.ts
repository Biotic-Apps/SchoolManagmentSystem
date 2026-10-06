import { Injectable } from '@nestjs/common';
import { forbiddenScope, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { fullName } from '../../students/student.mapper';

export interface StudentReach {
  studentId: string;
  name: string;
  schoolId: string;
  branchId: string;
  sessionId: string;
  sectionId: string;
  rollNo: number | null;
  active: boolean;
}

/**
 * A student's current (or latest) placement checked against the scope:
 * parents only their own children (404), staff their sections/branches (403).
 * Unlike StudentPlacementService it also finds promoted/graduated students.
 */
@Injectable()
export class StudentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async read(scope: Scope, studentId: string): Promise<StudentReach> {
    if (scope.guardian && !scope.canAccessStudent(studentId))
      throw notFound('Student');
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId },
      orderBy: [{ status: 'asc' }, { startDate: 'desc' }],
      include: { student: { select: { firstName: true, lastName: true } } },
    });
    if (!enrollment) throw notFound('Student');
    const reach: StudentReach = {
      studentId,
      name: fullName(enrollment.student),
      schoolId: enrollment.schoolId,
      branchId: enrollment.branchId,
      sessionId: enrollment.sessionId,
      sectionId: enrollment.sectionId,
      rollNo: enrollment.rollNo,
      active: enrollment.status === 'ACTIVE',
    };
    if (scope.guardian) return reach;
    const section = {
      id: reach.sectionId,
      branchId: reach.branchId,
      schoolId: reach.schoolId,
    };
    if (!scope.canReadSection(section)) throw forbiddenScope();
    return reach;
  }
}
