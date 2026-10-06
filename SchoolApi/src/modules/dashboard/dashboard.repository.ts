import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { studentScopeWhere } from '../students/student-scope';
import { activeAssignmentWhere } from '../users/active-assignment-where';
import type { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  schools(scope: Scope, q: DashboardQueryDto) {
    const visible = scope.global
      ? {}
      : { id: { in: [...scope.memberSchoolIds] } };
    return this.prisma.school.count({
      where: { AND: [visible, { id: q.schoolId, status: 'ACTIVE' }] },
    });
  }

  branches(scope: Scope, q: DashboardQueryDto) {
    return this.prisma.branch.count({
      where: {
        AND: [
          scope.branchTableFilter(),
          { schoolId: q.schoolId, id: q.branchId, status: 'ACTIVE' },
        ],
      },
    });
  }

  users(scope: Scope, q: DashboardQueryDto) {
    const assignment: Prisma.RoleAssignmentWhereInput = {
      AND: [
        activeAssignmentWhere(),
        scope.branchFilter(),
        { schoolId: q.schoolId, branchId: q.branchId },
      ],
    };
    const filtered = scope.global && !q.schoolId && !q.branchId;
    return this.prisma.user.count({
      where: {
        status: 'ACTIVE',
        ...(filtered ? {} : { roleAssignments: { some: assignment } }),
      },
    });
  }

  activeSessions(scope: Scope, q: DashboardQueryDto) {
    return this.prisma.academicSession.count({
      where: {
        AND: [
          scope.branchFilter(),
          {
            schoolId: q.schoolId,
            branchId: q.branchId,
            id: q.sessionId,
            status: 'ACTIVE',
          },
        ],
      },
    });
  }

  sections(scope: Scope, q: DashboardQueryDto) {
    return this.prisma.section.count({
      where: {
        AND: [
          scope.sectionLimited
            ? { id: { in: [...scope.sectionIds] } }
            : scope.branchFilter(),
          {
            schoolId: q.schoolId,
            branchId: q.branchId,
            status: 'ACTIVE',
            ...(q.sessionId
              ? { sessionId: q.sessionId }
              : { session: { status: 'ACTIVE' } }),
          },
        ],
      },
    });
  }

  students(scope: Scope, q: DashboardQueryDto) {
    return this.prisma.student.count({
      where: {
        AND: [
          studentScopeWhere(scope),
          { status: 'ACTIVE', schoolId: q.schoolId },
          q.branchId || q.sessionId
            ? {
                enrollments: {
                  some: {
                    status: 'ACTIVE',
                    branchId: q.branchId,
                    sessionId: q.sessionId,
                  },
                },
              }
            : {},
        ],
      },
    });
  }

  staff(scope: Scope, q: DashboardQueryDto) {
    if (scope.guardian) return Promise.resolve(0);
    const visible: Prisma.StaffWhereInput = scope.sectionLimited
      ? {
          assignments: {
            some: { endedAt: null, sectionId: { in: [...scope.sectionIds] } },
          },
        }
      : scope.branchFilter();
    return this.prisma.staff.count({
      where: {
        AND: [
          visible,
          {
            status: { in: ['ACTIVE', 'ON_LEAVE'] },
            schoolId: q.schoolId,
            branchId: q.branchId,
          },
        ],
      },
    });
  }

  pendingAdmissions(scope: Scope, q: DashboardQueryDto) {
    if (scope.guardian || scope.sectionLimited) return Promise.resolve(0);
    return this.prisma.admissionApplication.count({
      where: {
        AND: [
          scope.managedBranchFilter(),
          {
            schoolId: q.schoolId,
            branchId: q.branchId,
            sessionId: q.sessionId,
            status: {
              in: [
                'SUBMITTED',
                'DOCUMENTS_PENDING',
                'TEST_SCHEDULED',
                'TEST_COMPLETED',
                'OFFERED',
              ],
            },
          },
        ],
      },
    });
  }

  pendingChildLinks(scope: Scope, q: DashboardQueryDto) {
    if (scope.guardian || scope.sectionLimited) return Promise.resolve(0);
    return this.prisma.childLinkRequest.count({
      where: {
        AND: [
          scope.managedBranchFilter(),
          { status: 'REQUESTED', schoolId: q.schoolId, branchId: q.branchId },
        ],
      },
    });
  }

  findBranch(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
  }
}
