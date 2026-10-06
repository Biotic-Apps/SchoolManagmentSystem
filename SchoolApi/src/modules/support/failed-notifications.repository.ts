import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { parseDate } from '../../core/common/dates';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { FailedNotificationQueryDto } from './dto/failed-notification.dto';

const DAY_MS = 86_400_000;

export const DELIVERY_SELECT = {
  id: true,
  channel: true,
  status: true,
  attempts: true,
  lastError: true,
  updatedAt: true,
  notification: {
    select: {
      id: true,
      category: true,
      title: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          _count: { select: { devices: true } },
        },
      },
    },
  },
} as const;

export type DeliveryRow = Prisma.NotificationDeliveryGetPayload<{
  select: typeof DELIVERY_SELECT;
}>;

/** Notification deliveries for Settings › Support (super admin only). */
@Injectable()
export class FailedNotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: FailedNotificationQueryDto) {
    const where = this.where(query);
    const [rows, total] = await Promise.all([
      this.prisma.notificationDelivery.findMany({
        where,
        select: DELIVERY_SELECT,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.notificationDelivery.count({ where }),
    ]);
    return { rows, total };
  }

  async failedIds(
    query: FailedNotificationQueryDto,
    limit: number,
  ): Promise<string[]> {
    const rows = await this.prisma.notificationDelivery.findMany({
      where: this.where(query),
      select: { id: true },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
    return rows.map((row) => row.id);
  }

  find(id: string): Promise<DeliveryRow | null> {
    return this.prisma.notificationDelivery.findUnique({
      where: { id },
      select: DELIVERY_SELECT,
    });
  }

  /** Moves a FAILED delivery to PENDING; false when someone else got it first. */
  async claim(id: string): Promise<boolean> {
    const { count } = await this.prisma.notificationDelivery.updateMany({
      where: { id, status: 'FAILED' },
      data: { status: 'PENDING' },
    });
    return count === 1;
  }

  /** Message parts and the recipient's current contact details. */
  resendTarget(id: string) {
    return this.prisma.notificationDelivery.findUnique({
      where: { id },
      select: {
        channel: true,
        notification: {
          select: {
            id: true,
            title: true,
            body: true,
            user: {
              select: {
                id: true,
                status: true,
                email: true,
                phone: true,
                devices: { select: { fcmToken: true } },
              },
            },
          },
        },
      },
    });
  }

  private where(
    query: FailedNotificationQueryDto,
  ): Prisma.NotificationDeliveryWhereInput {
    return {
      status: 'FAILED',
      channel: query.channel,
      updatedAt: {
        gte: query.from ? parseDate(query.from) : undefined,
        lt: query.to
          ? new Date(parseDate(query.to).getTime() + DAY_MS)
          : undefined,
      },
      notification: query.schoolId
        ? {
            user: {
              roleAssignments: {
                some: { schoolId: query.schoolId, revokedAt: null },
              },
            },
          }
        : undefined,
    };
  }
}
