import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { canReadStudent, currentEnrollment } from '../students/student-scope';

export const GUARDIAN_ACCESS_INCLUDE = {
  user: {
    select: {
      email: true,
      phone: true,
      status: true,
      mustChangePassword: true,
      lastLoginAt: true,
    },
  },
  studentLinks: {
    include: {
      student: {
        select: {
          id: true,
          admissionNo: true,
          firstName: true,
          lastName: true,
          enrollments: {
            include: {
              section: {
                select: { name: true, schoolClass: { select: { name: true } } },
              },
            },
            orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.GuardianInclude;

export type GuardianAccessRow = Prisma.GuardianGetPayload<{
  include: typeof GUARDIAN_ACCESS_INCLUDE;
}>;

/** A guardian is reachable through a student the scope can reach. */
@Injectable()
export class GuardianAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async read(scope: Scope, id: string): Promise<GuardianAccessRow> {
    const row = await this.load(id);
    const ok =
      scope.canManageSchool(row.schoolId) ||
      row.studentLinks.some((l) =>
        canReadStudent(scope, l.studentId, l.student.enrollments),
      );
    if (!ok) throw forbiddenScope();
    return row;
  }

  async manage(scope: Scope, id: string): Promise<GuardianAccessRow> {
    const row = await this.load(id);
    const ok =
      scope.canManageSchool(row.schoolId) ||
      row.studentLinks.some((l) => {
        const e = currentEnrollment(l.student.enrollments);
        return (
          !!e && scope.canManageBranch({ id: e.branchId, schoolId: e.schoolId })
        );
      });
    if (!ok) throw forbiddenScope();
    return row;
  }

  private async load(id: string): Promise<GuardianAccessRow> {
    const row = await this.prisma.guardian.findUnique({
      where: { id },
      include: GUARDIAN_ACCESS_INCLUDE,
    });
    if (!row) throw notFound('Guardian');
    return row;
  }
}
