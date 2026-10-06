import { Injectable } from '@nestjs/common';
import type { Prisma, StaffStatus } from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { activeAssignmentWhere } from '../users/active-assignment-where';
import type { StaffQueryDto } from './dto/staff-input.dto';

export const ASSIGNMENT_INCLUDE = {
  section: { select: { name: true, schoolClass: { select: { name: true } } } },
  subject: { select: { name: true } },
  responsibleStaff: { select: { id: true, name: true } },
} satisfies Prisma.StaffAssignmentInclude;

export type AssignmentRow = Prisma.StaffAssignmentGetPayload<{
  include: typeof ASSIGNMENT_INCLUDE;
}>;

const staffInclude = () =>
  ({
    branch: { select: { name: true } },
    reviewer: { select: { id: true, name: true } },
    user: {
      select: {
        roleAssignments: {
          where: activeAssignmentWhere(),
          select: { role: { select: { key: true } } },
        },
      },
    },
    assignments: {
      where: { endedAt: null },
      include: ASSIGNMENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    },
  }) satisfies Prisma.StaffInclude;

export type StaffRow = Prisma.StaffGetPayload<{
  include: ReturnType<typeof staffInclude>;
}>;

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: StaffQueryDto) {
    const search = containsInsensitive(query.search);
    const where: Prisma.StaffWhereInput = {
      AND: [
        scope.branchFilter(),
        {
          branchId: query.branchId,
          designation: query.designation,
          status: query.status as StaffStatus | undefined,
        },
        search
          ? {
              OR: [
                { name: search },
                { employeeNo: search },
                { email: search },
                { phone: search },
              ],
            }
          : {},
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        include: staffInclude(),
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.staff.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.staff.findUnique({
      where: { id },
      include: staffInclude(),
    });
  }

  findByUser(userId: string) {
    return this.prisma.staff.findUnique({
      where: { userId },
      include: staffInclude(),
    });
  }

  assignments(staffId: string, sessionId?: string) {
    return this.prisma.staffAssignment.findMany({
      where: { staffId, sessionId, endedAt: null },
      include: ASSIGNMENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }
}
