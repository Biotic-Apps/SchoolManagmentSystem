import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ActiveAssignment } from './active-assignment';

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Non-ended assignments whose role, school and branch are active. */
  async loadCurrent(userId: string): Promise<ActiveAssignment[]> {
    const rows = await this.prisma.roleAssignment.findMany({
      where: {
        userId,
        revokedAt: null,
        OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
        role: { status: 'ACTIVE' },
        AND: [
          { OR: [{ schoolId: null }, { school: { status: 'ACTIVE' } }] },
          { OR: [{ branchId: null }, { branch: { status: 'ACTIVE' } }] },
        ],
      },
      include: {
        role: { select: { key: true, name: true } },
        school: { select: { name: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      roleId: row.roleId,
      roleKey: row.role.key,
      roleName: row.role.name,
      scopeType: row.scopeType,
      schoolId: row.schoolId,
      schoolName: row.school?.name ?? null,
      branchId: row.branchId,
      branchName: row.branch?.name ?? null,
      sectionId: row.sectionId,
      subjectId: row.subjectId,
      validFrom: row.validFrom.toISOString(),
      validUntil: row.validUntil?.toISOString() ?? null,
    }));
  }

  async permissionsOfRole(roleId: string): Promise<string[]> {
    const rows = await this.prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionKey: true },
    });
    return rows.map((row) => row.permissionKey);
  }
}
