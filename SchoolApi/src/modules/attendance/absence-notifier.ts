import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { NotificationService } from '../../core/notifications/notification.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SchoolPeopleService } from '../school-day/school-people.service';

/** Guardians of ABSENT/LATE students: one notification per student per day. */
@Injectable()
export class AbsenceNotifier {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
  ) {}

  async notify(
    registerId: string,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    const register = await db.attendanceRegister.findUnique({
      where: { id: registerId },
      select: {
        date: true,
        status: true,
        entries: {
          where: {
            status: { in: ['ABSENT', 'LATE'] },
            guardianNotifiedAt: null,
          },
          include: { student: { select: { firstName: true } } },
        },
      },
    });
    if (!register || !['SUBMITTED', 'LOCKED'].includes(register.status)) return;
    const guardians = await this.people.guardiansByStudent(
      register.entries.map((e) => e.studentId),
    );
    const date = formatDate(register.date);
    for (const entry of register.entries) {
      const claimed = await db.attendanceEntry.updateMany({
        where: { id: entry.id, guardianNotifiedAt: null },
        data: { guardianNotifiedAt: new Date() },
      });
      if (claimed.count === 0) continue;
      const word = entry.status === 'ABSENT' ? 'absent' : 'late';
      await this.notifications.notify({
        userIds: guardians.get(entry.studentId) ?? [],
        category: 'ATTENDANCE',
        title: `${entry.student.firstName} was ${word} today`,
        body: `${entry.student.firstName} was marked ${word} on ${date}.`,
        data: { studentId: entry.studentId, date, status: entry.status },
      });
    }
  }
}
