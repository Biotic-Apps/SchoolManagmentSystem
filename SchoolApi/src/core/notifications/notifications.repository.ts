import { Injectable } from '@nestjs/common';
import type {
  NotificationChannel,
  Prisma,
} from '../../generated/prisma/client';
import { toJson } from '../common/prisma-json';
import { toSkipTake } from '../common/pagination/paginate';
import type { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { NotifyInput } from './notification-jobs';

/** Rows whose in-app delivery was switched off by the school stay out of the inbox. */
const HIDDEN_FROM_INBOX: Prisma.NotificationWhereInput = {
  deliveries: { none: { channel: 'IN_APP', status: 'SKIPPED' } },
};

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, unreadOnly: boolean, page: PaginationQueryDto) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly && { readAt: null }),
      ...HIDDEN_FROM_INBOX,
    };
    const [rows, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(page),
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { rows, total };
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  exists(userId: string, id: string) {
    return this.prisma.notification.count({ where: { id, userId } });
  }

  recipients(userIds: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: userIds }, status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        phone: true,
        devices: { select: { fcmToken: true } },
      },
    });
  }

  async pushMuted(userIds: string[], category: string): Promise<Set<string>> {
    const rows = await this.prisma.notificationPreference.findMany({
      where: { userId: { in: userIds }, category, push: false },
      select: { userId: true },
    });
    return new Set(rows.map((row) => row.userId));
  }

  /**
   * Stores the in-app row (delivered, or SKIPPED + already read when the
   * school turned in-app off for the category) plus pending external rows.
   */
  createWithDeliveries(
    userId: string,
    input: NotifyInput,
    channels: NotificationChannel[],
    inApp = true,
  ) {
    const now = new Date();
    return this.prisma.notification.create({
      data: {
        userId,
        category: input.category,
        title: input.title,
        body: input.body,
        data: input.data ? toJson(input.data) : undefined,
        readAt: inApp ? undefined : now,
        deliveries: {
          create: [
            inApp
              ? { channel: 'IN_APP', status: 'SENT', attempts: 1, sentAt: now }
              : { channel: 'IN_APP', status: 'SKIPPED' },
            ...channels.map((channel) => ({ channel })),
          ],
        },
      },
      include: { deliveries: true },
    });
  }

  markDelivery(id: string, error?: string) {
    return this.prisma.notificationDelivery.update({
      where: { id },
      data: error
        ? {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: error.slice(0, 500),
          }
        : {
            status: 'SENT',
            attempts: { increment: 1 },
            sentAt: new Date(),
            lastError: null,
          },
    });
  }

  upsertDevice(userId: string, token: string, platform: 'WEB' | 'ANDROID') {
    return this.prisma.userDevice.upsert({
      where: { fcmToken: token },
      create: { userId, fcmToken: token, platform },
      update: { userId, platform, lastSeenAt: new Date() },
    });
  }

  /** Only the signed-in user's own device row. */
  removeDevice(userId: string, token: string) {
    return this.prisma.userDevice.deleteMany({
      where: { userId, fcmToken: token },
    });
  }
}
