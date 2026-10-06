import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { conflict, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import { ChannelRegistry } from '../../core/notifications/channels/channel-registry';
import { NotificationsRepository } from '../../core/notifications/notifications.repository';
import { maskContact } from './contact-mask';
import type {
  FailedNotificationDto,
  FailedNotificationQueryDto,
  ResendResultDto,
} from './dto/failed-notification.dto';
import {
  FailedNotificationsRepository,
  type DeliveryRow,
} from './failed-notifications.repository';

export const RESEND_ALL_LIMIT = 500;

function toDto(row: DeliveryRow): FailedNotificationDto {
  const user = row.notification.user;
  return {
    id: row.id,
    recipient: {
      userId: user.id,
      name: user.name,
      contact: maskContact(row.channel, {
        email: user.email,
        phone: user.phone,
        devices: user._count.devices,
      }),
    },
    channel: row.channel,
    category: row.notification.category,
    title: row.notification.title,
    status: row.status,
    attempts: row.attempts,
    lastError: row.lastError,
    at: row.updatedAt.toISOString(),
  };
}

/**
 * Failed deliveries and manual resend. Callers are checked by the
 * controller (settings.edit + SUPER_ADMIN active role). The message body is
 * never logged or audited.
 */
@Injectable()
export class FailedNotificationsService {
  constructor(
    private readonly repository: FailedNotificationsRepository,
    private readonly notifications: NotificationsRepository,
    private readonly channels: ChannelRegistry,
    private readonly audit: AuditService,
  ) {}

  async list(
    query: FailedNotificationQueryDto,
  ): Promise<PageResult<FailedNotificationDto>> {
    const { rows, total } = await this.repository.list(query);
    return toPageResult(rows.map(toDto), total, query);
  }

  async resend(id: string): Promise<FailedNotificationDto> {
    const row = await this.repository.find(id);
    if (!row) throw notFound('Notification delivery');
    if (row.status !== 'FAILED' || !(await this.repository.claim(id))) {
      throw conflict('Only failed deliveries can be resent');
    }
    await this.deliver(id);
    const after = (await this.repository.find(id))!;
    this.audit.stage({
      action: 'support.notification_resend',
      entityType: 'NotificationDelivery',
      entityId: id,
      before: { status: row.status, attempts: row.attempts },
      after: { status: after.status, attempts: after.attempts },
    });
    return toDto(after);
  }

  async resendAll(query: FailedNotificationQueryDto): Promise<ResendResultDto> {
    const ids = await this.repository.failedIds(query, RESEND_ALL_LIMIT);
    let resent = 0;
    let failed = 0;
    for (const id of ids) {
      if (!(await this.repository.claim(id))) continue;
      const ok = await this.deliver(id);
      if (ok) resent += 1;
      else failed += 1;
      this.audit.stage({
        action: 'support.notification_resend',
        entityType: 'NotificationDelivery',
        entityId: id,
        after: { status: ok ? 'SENT' : 'FAILED', bulk: true },
      });
    }
    return { resent, failed };
  }

  /** Sends to the recipient's current address/devices and records the result. */
  private async deliver(id: string): Promise<boolean> {
    const target = await this.repository.resendTarget(id);
    if (!target || target.channel === 'IN_APP') {
      await this.notifications.markDelivery(id, 'Nothing to resend');
      return false;
    }
    const { notification } = target;
    const user = notification.user;
    if (user.status !== 'ACTIVE') {
      await this.notifications.markDelivery(id, 'Recipient is not active');
      return false;
    }
    try {
      await this.channels.get(target.channel).send({
        userId: user.id,
        title: notification.title,
        body: notification.body,
        data: { notificationId: notification.id },
        email: user.email,
        phone: user.phone,
        deviceTokens: user.devices.map((device) => device.fcmToken),
      });
      await this.notifications.markDelivery(id);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.notifications.markDelivery(id, message);
      return false;
    }
  }
}
