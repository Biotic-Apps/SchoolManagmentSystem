import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../jobs/job-processor';
import { JobProcessorRegistry } from '../../jobs/job-processor.registry';
import { QUEUES } from '../../jobs/queues';
import { ChannelRegistry } from '../channels/channel-registry';
import type { ChannelMessage } from '../channels/channel-message';
import { allowedChannels, type ExternalChannel } from '../channel-switches';
import { isCritical } from '../notification-categories';
import { NOTIFICATION_JOBS, type NotifyInput } from '../notification-jobs';
import { NotificationsRepository } from '../notifications.repository';
import { RecipientSwitches } from './recipient-switches';

type Recipient = Awaited<
  ReturnType<NotificationsRepository['recipients']>
>[number];

function channelsFor(
  recipient: Recipient,
  wanted: ExternalChannel[],
): ExternalChannel[] {
  return wanted.filter(
    (channel) =>
      (channel === 'PUSH' && recipient.devices.length > 0) ||
      (channel === 'EMAIL' && !!recipient.email) ||
      (channel === 'SMS' && !!recipient.phone),
  );
}

/**
 * Creates in-app rows and delivers external channels for each recipient.
 * Channels switched off by the recipient's school(s) are not created at all;
 * a category with in-app off gets a SKIPPED in-app delivery (hidden from the
 * inbox) and nothing at all when no external channel is left.
 */
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
    private readonly switches: RecipientSwitches,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: NotifyInput): Promise<void> {
    const recipients = await this.repository.recipients(input.userIds);
    if (recipients.length === 0) return;
    const muted = isCritical(input.category)
      ? new Set<string>()
      : await this.repository.pushMuted(input.userIds, input.category);
    const switches = await this.switches.forUsers(
      recipients.map((r) => r.id),
      input.category,
    );
    for (const recipient of recipients) {
      const school = switches.get(recipient.id)!;
      const requested = (input.channels ?? ['PUSH']).filter(
        (channel) =>
          channel !== 'PUSH' || (!input.silent && !muted.has(recipient.id)),
      );
      const wanted = channelsFor(recipient, allowedChannels(requested, school));
      if (!school.IN_APP && wanted.length === 0) continue;
      const row = await this.repository.createWithDeliveries(
        recipient.id,
        input,
        wanted,
        school.IN_APP,
      );
      await this.deliver(recipient, input, row);
    }
  }

  private async deliver(
    recipient: Recipient,
    input: NotifyInput,
    row: Awaited<ReturnType<NotificationsRepository['createWithDeliveries']>>,
  ): Promise<void> {
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
