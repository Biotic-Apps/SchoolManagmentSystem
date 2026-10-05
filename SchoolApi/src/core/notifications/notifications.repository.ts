import { Injectable } from '@nestjs/common';
import type { NotificationChannel } from '../../generated/prisma/client';
import { toJson } from '../common/prisma-json';
import { toSkipTake } from '../common/pagination/paginate';
import type { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { NotifyInput } from './notification-jobs';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, unreadOnly: boolean, page: PaginationQueryDto) {
    const where = { userId, ...(unreadOnly && { readAt: null }) };
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

  /** Stores the in-app row (delivered) plus pending rows for other channels. */
  createWithDeliveries(
    userId: string,
    input: NotifyInput,
    channels: NotificationChannel[],
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        category: input.category,
        title: input.title,
        body: input.body,
        data: input.data ? toJson(input.data) : undefined,
        deliveries: {
          create: [
            {
              channel: 'IN_APP',
              status: 'SENT',
              attempts: 1,
              sentAt: new Date(),
            },
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
}
