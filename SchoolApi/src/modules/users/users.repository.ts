import { Injectable } from '@nestjs/common';
import type { Prisma, UserStatus } from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { activeAssignmentWhere } from './active-assignment-where';
import type { UserQueryDto } from './dto/user-query.dto';

/** Built per query: the active-assignment filter depends on the current time. */
const userInclude = () =>
  ({
    roleAssignments: {
      where: activeAssignmentWhere(),
      include: {
        role: { select: { key: true, name: true } },
        school: { select: { name: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    },
  }) satisfies Prisma.UserInclude;

export type UserRow = Prisma.UserGetPayload<{
  include: ReturnType<typeof userInclude>;
}>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Principals see staff of their branches, never Super Admins or principals. */
  visibleWhere(scope: Scope): Prisma.UserWhereInput {
    if (scope.global) return {};
    const active = activeAssignmentWhere();
    return {
      roleAssignments: {
        some: {
          AND: [
            active,
            {
              OR: [
                { schoolId: { in: [...scope.schoolIds] } },
                { branchId: { in: [...scope.branchIds] } },
              ],
            },
          ],
        },
      },
      NOT: {
        roleAssignments: {
          some: {
            AND: [
              active,
              {
                role: { key: { in: [RoleKey.SUPER_ADMIN, RoleKey.PRINCIPAL] } },
              },
            ],
          },
        },
      },
    };
  }

  async list(scope: Scope, query: UserQueryDto) {
    const search = containsInsensitive(query.search);
    const active = activeAssignmentWhere();
    const where: Prisma.UserWhereInput = {
      AND: [
        this.visibleWhere(scope),
        { status: query.status as UserStatus | undefined },
        search
          ? { OR: [{ name: search }, { email: search }, { phone: search }] }
          : {},
        query.role
          ? {
              roleAssignments: {
                some: { AND: [active, { role: { key: query.role } }] },
              },
            }
          : {},
        query.branchId
          ? {
              roleAssignments: {
                some: { AND: [active, { branchId: query.branchId }] },
              },
            }
          : {},
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: userInclude(),
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.user.count({ where }),
    ]);
    return { rows, total };
  }

  findVisible(scope: Scope, id: string) {
    return this.prisma.user.findFirst({
      where: { AND: [{ id }, this.visibleWhere(scope)] },
      include: userInclude(),
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: userInclude(),
    });
  }

  create(
    data: Prisma.UserUncheckedCreateInput,
    assignments: Prisma.RoleAssignmentUncheckedCreateWithoutUserInput[],
  ) {
    return this.prisma.user.create({
      data: { ...data, roleAssignments: { create: assignments } },
      include: userInclude(),
    });
  }

  update(id: string, data: Prisma.UserUncheckedUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: userInclude(),
    });
  }

  addAssignment(data: Prisma.RoleAssignmentUncheckedCreateInput) {
    return this.prisma.roleAssignment.create({ data });
  }

  findAssignment(userId: string, id: string) {
    return this.prisma.roleAssignment.findFirst({
      where: { id, userId, ...activeAssignmentWhere() },
      include: { role: { select: { key: true, schoolId: true } } },
    });
  }

  endAssignment(id: string) {
    return this.prisma.roleAssignment.update({
      where: { id },
      data: { validUntil: new Date() },
    });
  }
}
