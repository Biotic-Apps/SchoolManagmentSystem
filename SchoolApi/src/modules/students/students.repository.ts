import { Injectable } from '@nestjs/common';
import type { Prisma, StudentStatus } from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { StudentQueryDto } from './dto/student-query.dto';
import { studentScopeWhere } from './student-scope';

export const ENROLLMENT_INCLUDE = {
  branch: { select: { name: true } },
  session: { select: { name: true } },
  section: { select: { name: true, schoolClass: { select: { name: true } } } },
} satisfies Prisma.EnrollmentInclude;

export type EnrollmentRow = Prisma.EnrollmentGetPayload<{
  include: typeof ENROLLMENT_INCLUDE;
}>;

export const STUDENT_INCLUDE = {
  enrollments: {
    include: ENROLLMENT_INCLUDE,
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
  },
  guardianLinks: {
    where: { status: 'VERIFIED', isPrimary: true },
    include: { guardian: { select: { name: true, phone: true } } },
    take: 1,
  },
} satisfies Prisma.StudentInclude;

export type StudentRow = Prisma.StudentGetPayload<{
  include: typeof STUDENT_INCLUDE;
}>;

export const GUARDIAN_LINK_INCLUDE = {
  guardian: true,
} satisfies Prisma.StudentGuardianInclude;

export type GuardianLinkRow = Prisma.StudentGuardianGetPayload<{
  include: typeof GUARDIAN_LINK_INCLUDE;
}>;

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: StudentQueryDto) {
    const status = (query.status as StudentStatus | undefined) ?? 'ACTIVE';
    const search = containsInsensitive(query.search);
    const placed =
      query.branchId || query.sessionId || query.classId || query.sectionId;
    const where: Prisma.StudentWhereInput = {
      AND: [
        studentScopeWhere(scope),
        { status },
        search
          ? {
              OR: [
                { firstName: search },
                { lastName: search },
                { admissionNo: search },
              ],
            }
          : {},
        placed
          ? {
              enrollments: {
                some: {
                  branchId: query.branchId,
                  sessionId: query.sessionId,
                  sectionId: query.sectionId,
                  section: query.classId
                    ? { classId: query.classId }
                    : undefined,
                  ...(status === 'ACTIVE' && { status: 'ACTIVE' }),
                },
              },
            }
          : {},
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: STUDENT_INCLUDE,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        ...toSkipTake(query),
      }),
      this.prisma.student.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: STUDENT_INCLUDE,
    });
  }

  guardianLinks(studentId: string, verifiedOnly: boolean) {
    return this.prisma.studentGuardian.findMany({
      where: {
        studentId,
        status: verifiedOnly ? 'VERIFIED' : { in: ['VERIFIED', 'REQUESTED'] },
      },
      include: GUARDIAN_LINK_INCLUDE,
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  healthProfile(studentId: string) {
    return this.prisma.studentHealthProfile.findUnique({
      where: { studentId },
    });
  }

  enrollments(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: ENROLLMENT_INCLUDE,
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  update(id: string, data: Prisma.StudentUncheckedUpdateInput) {
    return this.prisma.student.update({
      where: { id },
      data,
      include: STUDENT_INCLUDE,
    });
  }

  findSection(id: string) {
    return this.prisma.section.findUnique({
      where: { id },
      include: {
        school: { select: { code: true } },
        session: { select: { status: true } },
      },
    });
  }
}
