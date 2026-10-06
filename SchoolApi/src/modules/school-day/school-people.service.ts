import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RoleKey } from '../../core/rbac/role-key.enum';

/** Who to notify or route to: guardians, class teachers, branch leaders. */
@Injectable()
export class SchoolPeopleService {
  constructor(private readonly prisma: PrismaService) {}

  /** Guardian user ids per student (verified links with a login). */
  async guardiansByStudent(
    studentIds: string[],
  ): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (studentIds.length === 0) return map;
    const links = await this.prisma.studentGuardian.findMany({
      where: {
        studentId: { in: studentIds },
        status: 'VERIFIED',
        guardian: { userId: { not: null } },
      },
      select: { studentId: true, guardian: { select: { userId: true } } },
    });
    for (const link of links) {
      map.set(link.studentId, [
        ...(map.get(link.studentId) ?? []),
        link.guardian.userId!,
      ]);
    }
    return map;
  }

  async guardianUserIds(studentIds: string[]): Promise<string[]> {
    const map = await this.guardiansByStudent(studentIds);
    return [...new Set([...map.values()].flat())];
  }

  async activeStudentIds(sectionIds: string[]): Promise<string[]> {
    const rows = await this.prisma.enrollment.findMany({
      where: { sectionId: { in: sectionIds }, status: 'ACTIVE' },
      select: { studentId: true },
    });
    return rows.map((r) => r.studentId);
  }

  /** Class teacher of a section: staff id and login. */
  async classTeacher(
    sectionId: string,
  ): Promise<{ staffId: string; userId: string | null } | null> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { classTeacher: { select: { id: true, userId: true } } },
    });
    const teacher = section?.classTeacher;
    return teacher ? { staffId: teacher.id, userId: teacher.userId } : null;
  }

  async principalOf(branchId: string): Promise<string | null> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { principalUserId: true },
    });
    return branch?.principalUserId ?? null;
  }

  /** Users holding a role in the branch right now (e.g. COORDINATOR). */
  async roleHolders(branchId: string, role: RoleKey): Promise<string[]> {
    const now = new Date();
    const rows = await this.prisma.roleAssignment.findMany({
      where: {
        branchId,
        role: { key: role },
        revokedAt: null,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        user: { status: 'ACTIVE' },
      },
      select: { userId: true },
    });
    return [...new Set(rows.map((r) => r.userId))];
  }

  async superAdmins(): Promise<string[]> {
    const rows = await this.prisma.roleAssignment.findMany({
      where: {
        scopeType: 'GLOBAL',
        role: { key: RoleKey.SUPER_ADMIN },
        revokedAt: null,
        user: { status: 'ACTIVE' },
      },
      select: { userId: true },
      orderBy: { createdAt: 'asc' },
    });
    return [...new Set(rows.map((r) => r.userId))];
  }

  async staffOfUser(userId: string) {
    return this.prisma.staff.findUnique({ where: { userId } });
  }

  async names(userIds: string[]): Promise<Map<string, string>> {
    const rows = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(userIds)] } },
      select: { id: true, name: true },
    });
    return new Map(rows.map((r) => [r.id, r.name]));
  }
}
