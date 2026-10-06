import { Injectable } from '@nestjs/common';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';

export interface StudentPlacement {
  studentId: string;
  name: string;
  schoolId: string;
  branchId: string;
  sessionId: string;
  sectionId: string;
}

/** A student's current section, checked against the caller's scope. */
@Injectable()
export class StudentPlacementService {
  constructor(private readonly prisma: PrismaService) {}

  async find(studentId: string): Promise<StudentPlacement | null> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, status: 'ACTIVE' },
      include: { student: { select: { firstName: true, lastName: true } } },
    });
    if (!enrollment) return null;
    return {
      studentId,
      name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      schoolId: enrollment.schoolId,
      branchId: enrollment.branchId,
      sessionId: enrollment.sessionId,
      sectionId: enrollment.sectionId,
    };
  }

  /** Parents: own child else 404; staff: section/branch scope else 403. */
  async read(scope: Scope, studentId: string): Promise<StudentPlacement> {
    if (scope.guardian && !scope.canAccessStudent(studentId))
      throw notFound('Student');
    const placement = await this.find(studentId);
    if (!placement) throw notFound('Student');
    if (scope.guardian) return placement;
    if (!scope.canReadSection(sectionRef(placement))) throw forbiddenScope();
    return placement;
  }
}

export const sectionRef = (p: {
  sectionId: string;
  branchId: string;
  schoolId: string;
}) => ({ id: p.sectionId, branchId: p.branchId, schoolId: p.schoolId });
