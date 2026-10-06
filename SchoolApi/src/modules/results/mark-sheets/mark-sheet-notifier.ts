import { Injectable } from '@nestjs/common';
import type { MarkSheet } from '../../../generated/prisma/client';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import { SchoolPeopleService } from '../../school-day/school-people.service';

const present = (ids: (string | null | undefined)[]) =>
  ids.filter((id): id is string => !!id);

/** Submitted → coordinators/head teachers/principal; returned → teacher. */
@Injectable()
export class MarkSheetNotifier {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
  ) {}

  async submitted(sheet: MarkSheet, actorId: string): Promise<void> {
    const [coordinators, heads, principal] = await Promise.all([
      this.people.roleHolders(sheet.branchId, RoleKey.COORDINATOR),
      this.people.roleHolders(sheet.branchId, RoleKey.HEAD_TEACHER),
      this.people.principalOf(sheet.branchId),
    ]);
    await this.notifications.notify({
      userIds: present([...coordinators, ...heads, principal]).filter(
        (id) => id !== actorId,
      ),
      category: 'EXAM',
      title: 'Marks submitted',
      body: `${await this.label(sheet)} marks were submitted for review.`,
      data: { markSheetId: sheet.id, examId: sheet.examId },
    });
  }

  async returned(sheet: MarkSheet, comment: string | null): Promise<void> {
    const teacher = sheet.teacherStaffId
      ? await this.prisma.staff.findUnique({
          where: { id: sheet.teacherStaffId },
          select: { userId: true },
        })
      : null;
    await this.notifications.notify({
      userIds: present([teacher?.userId, sheet.submittedById]),
      category: 'EXAM',
      title: 'Marks returned',
      body: `${await this.label(sheet)} marks were returned${comment ? `: ${comment}` : '.'}`,
      data: { markSheetId: sheet.id, examId: sheet.examId },
    });
  }

  private async label(sheet: MarkSheet): Promise<string> {
    const [section, subject] = await Promise.all([
      this.prisma.section.findUnique({
        where: { id: sheet.sectionId },
        select: { name: true, schoolClass: { select: { name: true } } },
      }),
      this.prisma.subject.findUnique({
        where: { id: sheet.subjectId },
        select: { name: true },
      }),
    ]);
    return `${section?.schoolClass.name ?? ''}-${section?.name ?? ''} ${subject?.name ?? ''}`.trim();
  }
}
