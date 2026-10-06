import { Injectable, OnModuleInit } from '@nestjs/common';
import type { NotificationChannel } from '../../../generated/prisma/client';
import type { JobProcessor } from '../../jobs/job-processor';
import { JobProcessorRegistry } from '../../jobs/job-processor.registry';
import { QUEUES } from '../../jobs/queues';
import { ChannelRegistry } from '../channels/channel-registry';
import type { ChannelMessage } from '../channels/channel-message';
import { isCritical } from '../notification-categories';
import { NOTIFICATION_JOBS, type NotifyInput } from '../notification-jobs';
import { NotificationsRepository } from '../notifications.repository';

type Recipient = Awaited<
  ReturnType<NotificationsRepository['recipients']>
>[number];

function channelsFor(
  recipient: Recipient,
  wanted: NotificationChannel[],
): NotificationChannel[] {
  return wanted.filter(
    (channel) =>
      (channel === 'PUSH' && recipient.devices.length > 0) ||
      (channel === 'EMAIL' && !!recipient.email) ||
      (channel === 'SMS' && !!recipient.phone),
  );
}

/** Creates in-app rows and delivers external channels for each recipient. */
@Injectable()
export class SendNotificationProcessor
  implements JobProcessor<NotifyInput>, OnModuleInit
{
  readonly queue = QUEUES.NOTIFICATIONS;
  readonly name = NOTIFICATION_JOBS.SEND;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly repository: NotificationsRepository,
    private readonly channels: ChannelRegistry,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: NotifyInput): Promise<void> {
    const recipients = await this.repository.recipients(input.userIds);
    const muted = isCritical(input.category)
      ? new Set<string>()
      : await this.repository.pushMuted(input.userIds, input.category);
    for (const recipient of recipients) {
      const requested = (input.channels ?? ['PUSH']).filter(
        (channel) =>
          channel !== 'PUSH' || (!input.silent && !muted.has(recipient.id)),
      );
      const wanted = channelsFor(recipient, requested);
      const row = await this.repository.createWithDeliveries(
        recipient.id,
        input,
        wanted,
      );
      const message: ChannelMessage = {
        userId: recipient.id,
        title: input.title,
        body: input.body,
        data: { notificationId: row.id },
        email: recipient.email,
        phone: recipient.phone,
        deviceTokens: recipient.devices.map((device) => device.fcmToken),
      };
      for (const delivery of row.deliveries.filter(
        (d) => d.channel !== 'IN_APP',
      )) {
        await this.channels
          .get(delivery.channel)
          .send(message)
          .then(() => this.repository.markDelivery(delivery.id))
          .catch((error: Error) =>
            this.repository.markDelivery(delivery.id, error.message),
          );
      }
    }
  }
}
