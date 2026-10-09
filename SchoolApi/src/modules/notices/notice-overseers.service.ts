import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { NotificationService } from '../../core/notifications/notification.service';
import { RoleKey } from '../../core/rbac/role-key.enum';

type Db = Prisma.TransactionClient;

export interface OverseenNotice {
  id: string;
  schoolId: string;
  branchId: string | null;
  authorId: string;
  title: string;
  body: string;
}

/**
 * Principals oversee every notice of their branch (school-scoped principals:
 * the whole school), whoever posts it and whoever it is addressed to.
 */
@Injectable()
export class NoticeOverseers {
  constructor(private readonly notifications: NotificationService) {}

  /** Active principals of the notice's branch, or of its school. */
  async principals(
    notice: Pick<OverseenNotice, 'schoolId' | 'branchId'>,
    db: Db,
  ): Promise<string[]> {
    const now = new Date();
    const rows = await db.roleAssignment.findMany({
      where: {
        role: { key: RoleKey.PRINCIPAL },
        revokedAt: null,
        validFrom: { lte: now },
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gt: now } }] },
          { OR: this.reach(notice) },
        ],
        user: { status: 'ACTIVE' },
      },
      select: { userId: true },
    });
    return [...new Set(rows.map((r) => r.userId))];
  }

  /** Tells principals a notice was posted (skips the given users). */
  async notifyPosted(
    notice: OverseenNotice,
    skip: Iterable<string>,
    db: Db,
  ): Promise<void> {
    await this.send(notice, skip, db, `New notice: ${notice.title}`);
  }

  /** Tells principals a notice is waiting for their approval. */
  async notifyPending(notice: OverseenNotice, db: Db): Promise<void> {
    await this.send(
      notice,
      [],
      db,
      `Notice awaiting approval: ${notice.title}`,
    );
  }

  private async send(
    notice: OverseenNotice,
    skip: Iterable<string>,
    db: Db,
    title: string,
  ): Promise<void> {
    const skipped = new Set([...skip, notice.authorId]);
    const userIds = (await this.principals(notice, db)).filter(
      (id) => !skipped.has(id),
    );
    await this.notifications.notify({
      userIds,
      category: 'NOTICE',
      title,
      body: notice.body.slice(0, 200),
      data: { noticeId: notice.id },
    });
  }

  private reach(
    notice: Pick<OverseenNotice, 'schoolId' | 'branchId'>,
  ): Prisma.RoleAssignmentWhereInput[] {
    if (!notice.branchId) return [{ schoolId: notice.schoolId }];
    return [
      { branchId: notice.branchId },
      { scopeType: 'SCHOOL', schoolId: notice.schoolId },
    ];
  }
}
