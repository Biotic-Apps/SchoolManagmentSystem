import { Injectable } from '@nestjs/common';
import { notFound } from '../common/errors/errors';
import type { PageResult } from '../common/pagination/page-result';
import { toPageResult } from '../common/pagination/paginate';
import type { NotificationDto } from './dto/notification.dto';
import type { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationInboxService {
  constructor(private readonly repository: NotificationsRepository) {}

  async list(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<PageResult<NotificationDto>> {
    const { rows, total } = await this.repository.list(
      userId,
      query.unread === true,
      query,
    );
    const items = rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      body: row.body,
      data: row.data,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }));
    return toPageResult(items, total, query);
  }

  unreadCount(userId: string): Promise<number> {
    return this.repository.unreadCount(userId);
  }

  async markRead(userId: string, id: string): Promise<void> {
    if ((await this.repository.exists(userId, id)) === 0)
      throw notFound('Notification');
    await this.repository.markRead(userId, id);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repository.markAllRead(userId);
  }

  async registerDevice(
    userId: string,
    token: string,
    platform: 'WEB' | 'ANDROID',
  ) {
    await this.repository.upsertDevice(userId, token, platform);
  }
}
