import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { NotificationService } from '../../core/notifications/notification.service';
import { SchoolPeopleService } from '../school-day/school-people.service';

/** Marks an entry PUBLISHED and tells the section's guardians. */
@Injectable()
export class DiaryPublisher {
  constructor(
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
  ) {}

  async publish(
    tx: Prisma.TransactionClient,
    entryId: string,
    publishedById: string,
  ): Promise<void> {
    const entry = await tx.diaryEntry.update({
      where: { id: entryId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedById,
        comment: null,
      },
      include: { subject: { select: { name: true } } },
    });
    const students = await this.people.activeStudentIds([entry.sectionId]);
    await this.notifications.notify({
      userIds: await this.people.guardianUserIds(students),
      category: 'DIARY',
      title: `Diary: ${entry.subject.name}`,
      body: entry.homework
        ? `Homework: ${entry.homework.slice(0, 140)}`
        : entry.topics.slice(0, 160),
      data: {
        diaryId: entry.id,
        sectionId: entry.sectionId,
        date: formatDate(entry.date),
      },
    });
  }
}
