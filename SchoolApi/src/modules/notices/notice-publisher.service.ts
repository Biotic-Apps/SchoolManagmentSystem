import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { NotificationService } from '../../core/notifications/notification.service';
import { NoticeRecipientsService } from './notice-recipients.service';

/** Publishes a notice: resolves recipients, stores them and notifies. */
@Injectable()
export class NoticePublisher {
  constructor(
    private readonly recipients: NoticeRecipientsService,
    private readonly notifications: NotificationService,
  ) {}

  async publish(
    noticeId: string,
    publishedById: string,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const notice = await tx.notice.findUniqueOrThrow({
      where: { id: noticeId },
    });
    const userIds = await this.recipients.resolve(notice, tx);
    await tx.notice.update({
      where: { id: noticeId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedById,
        comment: null,
      },
    });
    await tx.noticeRecipient.createMany({
      data: userIds.map((userId) => ({ noticeId, userId })),
      skipDuplicates: true,
    });
    await this.notifications.notify({
      userIds,
      category: 'NOTICE',
      title: notice.title,
      body: notice.body.slice(0, 200),
      data: { noticeId },
    });
    return userIds.length;
  }
}
