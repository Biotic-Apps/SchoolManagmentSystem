import { Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { domainError, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { assertSessionOpen } from '../../academic-sessions/session-lock';
import { appliesTo } from '../../academics/curriculum/curriculum';
import { OWN_ASSIGNMENT_MESSAGE } from '../assignments/staff-assignments.service';

const LEFT = new Set(['RESIGNED', 'TERMINATED']);

/** Loads and checks the section, subject and staff of an allocation change (contract §5.3). */
@Injectable()
export class AllocationTarget {
  constructor(private readonly prisma: PrismaService) {}

  async section(scope: Scope, sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { session: true, schoolClass: { select: { name: true } } },
    });
    if (!section || section.status !== 'ACTIVE') throw notFound('Section');
    scope.assertManageBranch({
      id: section.branchId,
      schoolId: section.schoolId,
    });
    assertSessionOpen(section.session);
    return section;
  }

  async assertSubject(
    section: { classId: string; group: string | null },
    subjectId: string,
  ): Promise<void> {
    const link = await this.prisma.classSubject.findFirst({
      where: { classId: section.classId, subjectId, status: 'ACTIVE' },
      include: { subject: { select: { name: true } } },
    });
    if (!link)
      throw domainError(
        ErrorCode.SUBJECT_NOT_IN_CLASS,
        'Subject is not taught in this class',
      );
    if (!appliesTo(link.group, section.group))
      throw domainError(
        ErrorCode.SUBJECT_NOT_IN_GROUP,
        `${link.subject.name} is taught only in ${link.group} sections`,
      );
  }

  async staff(schoolId: string, staffId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        userId: true,
        schoolId: true,
        status: true,
      },
    });
    if (!staff || staff.schoolId !== schoolId)
      throw domainError(ErrorCode.UNKNOWN_STAFF, 'Staff member not found');
    if (LEFT.has(staff.status))
      throw domainError(ErrorCode.STAFF_LEFT, `${staff.name} has left`);
    return staff;
  }

  /** Nobody changes their own assignments (also when replacing themselves). */
  assertNotOwn(user: AuthUser, ...userIds: (string | null | undefined)[]) {
    if (userIds.some((id) => id && id === user.id))
      throw domainError(ErrorCode.OWN_ASSIGNMENT, OWN_ASSIGNMENT_MESSAGE);
  }
}
