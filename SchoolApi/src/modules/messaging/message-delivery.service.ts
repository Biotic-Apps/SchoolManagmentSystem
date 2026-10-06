import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { NotificationService } from '../../core/notifications/notification.service';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';
import { deliversSilently, type OfficeHours } from './office-hours';

/** Marks a message SENT and notifies the other participants (silently after hours). */
@Injectable()
export class MessageDelivery {
  constructor(
    private readonly settings: BranchSettingsReader,
    private readonly notifications: NotificationService,
  ) {}

  async deliver(
    messageId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ deliveredSilently: boolean }> {
    const message = await tx.message.findUniqueOrThrow({
      where: { id: messageId },
      include: {
        thread: {
          select: {
            id: true,
            subject: true,
            branchId: true,
            participants: { select: { userId: true } },
          },
        },
        sender: { select: { name: true } },
      },
    });
    const now = new Date();
    const hours = await this.settings.get<OfficeHours>(
      message.thread.branchId,
      'messaging.officeHours',
    );
    const silent = deliversSilently(now, hours);
    await tx.message.update({
      where: { id: messageId },
      data: {
        status: 'SENT',
        deliveredSilently: silent,
        pendingApprovalId: null,
        sentAt: now,
      },
    });
    await tx.messageThread.update({
      where: { id: message.threadId },
      data: { lastMessageAt: now },
    });
    await this.notifications.notify({
      userIds: message.thread.participants
        .map((p) => p.userId)
        .filter((id) => id !== message.senderId),
      category: 'MESSAGE',
      title: `${message.sender.name}: ${message.thread.subject}`,
      body: message.body.slice(0, 200),
      data: { threadId: message.threadId, messageId },
      silent,
    });
    return { deliveredSilently: silent };
  }
}
