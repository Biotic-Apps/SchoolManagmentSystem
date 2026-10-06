import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { RoleKey } from '../../core/rbac/role-key.enum';
import { readNoticeAudience } from './notice-audience';

type Db = Prisma.TransactionClient;

export interface NoticeTarget {
  schoolId: string;
  branchId: string | null;
  authorId: string;
  audience: Prisma.JsonValue;
}

/** Expands a notice audience into the user ids that receive it. */
@Injectable()
export class NoticeRecipientsService {
  async resolve(notice: NoticeTarget, db: Db): Promise<string[]> {
    const a = readNoticeAudience(notice.audience);
    const users = new Set<string>();
    const add = (ids: (string | null)[]) =>
      ids.forEach((id) => id && users.add(id));
    const guardians = !a.staffOnly;

    if (a.schoolWide) {
      add(
        await this.assignmentUsers(
          db,
          { schoolId: notice.schoolId },
          a.staffOnly,
        ),
      );
      if (guardians)
        add(await this.guardianUsers(db, { schoolId: notice.schoolId }));
    }
    if (a.branchIds.length > 0) {
      add(
        await this.assignmentUsers(db, { branchId: { in: a.branchIds } }, true),
      );
      if (guardians)
        add(await this.guardianUsers(db, { branchId: { in: a.branchIds } }));
    }
    const sectionIds = await this.sectionIds(
      db,
      notice,
      a.sectionIds,
      a.classIds,
    );
    if (sectionIds.length > 0) {
      add(await this.teacherUsers(db, sectionIds));
      if (guardians)
        add(await this.guardianUsers(db, { sectionId: { in: sectionIds } }));
    }
    if (guardians && a.guardianIds.length > 0) {
      const rows = await db.guardian.findMany({
        where: { id: { in: a.guardianIds }, userId: { not: null } },
        select: { userId: true },
      });
      add(rows.map((r) => r.userId));
    }
    users.delete(notice.authorId);
    const active = await db.user.findMany({
      where: { id: { in: [...users] }, status: 'ACTIVE' },
      select: { id: true },
    });
    return active.map((u) => u.id);
  }

  private async assignmentUsers(
    db: Db,
    where: Prisma.RoleAssignmentWhereInput,
    staffOnly: boolean,
  ): Promise<string[]> {
    const now = new Date();
    const rows = await db.roleAssignment.findMany({
      where: {
        ...where,
        revokedAt: null,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        ...(staffOnly ? { role: { key: { not: RoleKey.PARENT } } } : {}),
      },
      select: { userId: true },
    });
    return rows.map((r) => r.userId);
  }

  /** Verified guardians (with a login) of ACTIVE students enrolled where given. */
  private async guardianUsers(
    db: Db,
    enrollment: Prisma.EnrollmentWhereInput,
  ): Promise<(string | null)[]> {
    const rows = await db.studentGuardian.findMany({
      where: {
        status: 'VERIFIED',
        guardian: { userId: { not: null } },
        student: {
          status: 'ACTIVE',
          enrollments: { some: { status: 'ACTIVE', ...enrollment } },
        },
      },
      select: { guardian: { select: { userId: true } } },
    });
    return rows.map((r) => r.guardian.userId);
  }

  /** Class and subject teachers of the sections. */
  private async teacherUsers(
    db: Db,
    sectionIds: string[],
  ): Promise<(string | null)[]> {
    const [assignments, sections] = await Promise.all([
      db.staffAssignment.findMany({
        where: {
          sectionId: { in: sectionIds },
          kind: { in: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
          endedAt: null,
        },
        select: { staff: { select: { userId: true } } },
      }),
      db.section.findMany({
        where: { id: { in: sectionIds } },
        select: { classTeacher: { select: { userId: true } } },
      }),
    ]);
    return [
      ...assignments.map((r) => r.staff.userId),
      ...sections.map((s) => s.classTeacher?.userId ?? null),
    ];
  }

  /** Listed sections plus the active sections of listed classes. */
  private async sectionIds(
    db: Db,
    notice: NoticeTarget,
    sectionIds: string[],
    classIds: string[],
  ): Promise<string[]> {
    if (classIds.length === 0) return sectionIds;
    const rows = await db.section.findMany({
      where: {
        classId: { in: classIds },
        status: 'ACTIVE',
        schoolId: notice.schoolId,
        ...(notice.branchId ? { branchId: notice.branchId } : {}),
      },
      select: { id: true },
    });
    return [...new Set([...sectionIds, ...rows.map((r) => r.id)])];
  }
}
