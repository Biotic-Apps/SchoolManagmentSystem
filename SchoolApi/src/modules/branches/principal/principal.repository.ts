import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import { activeAssignmentWhere } from '../../users/active-assignment-where';

@Injectable()
export class PrincipalRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveUser(id: string) {
    return this.prisma.user.findFirst({
      where: { id, status: 'ACTIVE' },
      select: { id: true, name: true },
    });
  }

  /** Ends other principals' assignments, ensures the new one, sets branch.principal. */
  replace(
    branch: { id: string; schoolId: string },
    userId: string,
    actorId: string,
  ) {
    return this.prisma.$transaction((tx) =>
      this.assign(tx, branch, userId, actorId),
    );
  }

  /**
   * `replace` inside a caller's transaction: BRANCH PRINCIPAL assignment and
   * `branch.principalUserId` stay in sync. Returns the user ids that lost it.
   */
  async assign(
    tx: Prisma.TransactionClient,
    branch: { id: string; schoolId: string },
    userId: string,
    actorId: string,
  ): Promise<string[]> {
    const role = await tx.role.findFirstOrThrow({
      where: { key: RoleKey.PRINCIPAL, schoolId: null },
    });
    const current = await tx.roleAssignment.findMany({
      where: {
        roleId: role.id,
        branchId: branch.id,
        ...activeAssignmentWhere(),
      },
    });
    const previous = current.filter((a) => a.userId !== userId);
    await tx.roleAssignment.updateMany({
      where: { id: { in: previous.map((a) => a.id) } },
      data: { validUntil: new Date() },
    });
    if (!current.some((a) => a.userId === userId)) {
      await tx.roleAssignment.create({
        data: {
          userId,
          roleId: role.id,
          scopeType: 'BRANCH',
          schoolId: branch.schoolId,
          branchId: branch.id,
          grantedById: actorId,
        },
      });
    }
    await tx.branch.update({
      where: { id: branch.id },
      data: { principalUserId: userId, updatedById: actorId },
    });
    return [...new Set(previous.map((a) => a.userId))];
  }
}
