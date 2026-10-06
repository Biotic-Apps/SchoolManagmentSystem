import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AccessCache } from '../../../core/rbac/access/access-cache';

interface Endable {
  id: string;
  kind: string;
  sectionId: string | null;
  staffId: string;
  roleAssignmentId: string | null;
}

/** Ends staff assignments with their mirrored role assignments. */
@Injectable()
export class AssignmentEnder {
  constructor(private readonly access: AccessCache) {}

  async end(
    tx: Prisma.TransactionClient,
    rows: Endable[],
    at = new Date(),
  ): Promise<void> {
    for (const row of rows) {
      await tx.staffAssignment.update({
        where: { id: row.id },
        data: { endedAt: at },
      });
      if (row.roleAssignmentId) {
        await tx.roleAssignment.update({
          where: { id: row.roleAssignmentId },
          data: { validUntil: at },
        });
      }
      if (row.kind === 'CLASS_TEACHER' && row.sectionId) {
        await tx.section.updateMany({
          where: { id: row.sectionId, classTeacherStaffId: row.staffId },
          data: { classTeacherStaffId: null },
        });
      }
    }
  }

  async refresh(userIds: (string | null)[]): Promise<void> {
    const ids = [...new Set(userIds.filter((id): id is string => !!id))];
    await Promise.all(ids.map((id) => this.access.invalidateUser(id)));
  }
}
