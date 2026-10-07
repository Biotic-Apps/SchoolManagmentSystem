import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../jobs/job-processor';
import { JobProcessorRegistry } from '../../jobs/job-processor.registry';
import { QUEUES } from '../../jobs/queues';
import { ChannelRegistry } from '../channels/channel-registry';
import {
  NOTIFICATION_JOBS,
  type DirectMessageInput,
} from '../notification-jobs';
import { NotificationsRepository } from '../notifications.repository';

@Injectable()
export class DirectMessageProcessor
  implements JobProcessor<DirectMessageInput>, OnModuleInit
{
  readonly queue = QUEUES.NOTIFICATIONS;
  readonly name = NOTIFICATION_JOBS.DIRECT;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly repository: NotificationsRepository,
    private readonly channels: ChannelRegistry,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: DirectMessageInput): Promise<void> {
    if (input.to) {
      await this.channels.get(input.channel).send({
        userId: input.userId,
        title: input.title,
        body: input.body,
        email: input.to.email,
        phone: input.to.phone,
      });
      return;
    }
    if (!input.userId) return;
    const [recipient] = await this.repository.recipients([input.userId]);
    if (!recipient) return;
    await this.channels.get(input.channel).send({
      userId: recipient.id,
      title: input.title,
      body: input.body,
      email: recipient.email,
      phone: recipient.phone,
      deviceTokens: recipient.devices.map((device) => device.fcmToken),
    });
  }
}
