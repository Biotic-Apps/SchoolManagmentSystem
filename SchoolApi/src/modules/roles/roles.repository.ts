import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { activeAssignmentWhere } from '../users/active-assignment-where';

const INCLUDE = {
  permissions: { select: { permissionKey: true } },
} satisfies Prisma.RoleInclude;

export type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: typeof INCLUDE;
}>;

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(scope: Scope) {
    const visible: Prisma.RoleWhereInput = scope.global
      ? {}
      : {
          OR: [
            { schoolId: null },
            { schoolId: { in: [...scope.memberSchoolIds] } },
          ],
        };
    return this.prisma.role.findMany({
      where: { status: 'ACTIVE', ...visible },
      include: INCLUDE,
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  findById(id: string) {
    return this.prisma.role.findFirst({
      where: { id, status: 'ACTIVE' },
      include: INCLUDE,
    });
  }

  async activeAssignmentCounts(
    roleIds: string[],
  ): Promise<Map<string, number>> {
    const rows = await this.prisma.roleAssignment.groupBy({
      by: ['roleId'],
      where: { roleId: { in: roleIds }, ...activeAssignmentWhere() },
      _count: { _all: true },
    });
    return new Map(rows.map((row) => [row.roleId, row._count._all]));
  }

  create(data: {
    key: string;
    name: string;
    schoolId: string | null;
    permissions: string[];
    actorId: string;
  }) {
    return this.prisma.role.create({
      data: {
        key: data.key,
        name: data.name,
        schoolId: data.schoolId,
        createdById: data.actorId,
        permissions: {
          create: data.permissions.map((permissionKey) => ({ permissionKey })),
        },
      },
      include: INCLUDE,
    });
  }

  update(
    id: string,
    data: { name?: string; permissions?: string[]; actorId: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (data.permissions) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: data.permissions.map((permissionKey) => ({
            roleId: id,
            permissionKey,
          })),
        });
      }
      return tx.role.update({
        where: { id },
        data: { name: data.name, updatedById: data.actorId },
        include: INCLUDE,
      });
    });
  }

  /** Deletes a never-used role, or archives one that has assignment history. */
  async remove(id: string): Promise<void> {
    const used = await this.prisma.roleAssignment.count({
      where: { roleId: id },
    });
    if (used > 0) {
      await this.prisma.role.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });
      return;
    }
    await this.prisma.role.delete({ where: { id } });
  }
}
