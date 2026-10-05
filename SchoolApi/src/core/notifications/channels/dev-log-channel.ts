import { Logger } from '@nestjs/common';
import type { NotificationChannel } from '../../../generated/prisma/client';
import type { AppConfigService } from '../../../config/app-config.service';
import { ChannelAdapter } from './channel-adapter';
import type { ChannelMessage } from './channel-message';

/**
 * Channel without a provider yet: logs in development/test and fails in
 * production so the delivery shows up as FAILED (never silently "sent").
 */
export abstract class DevLogChannel extends ChannelAdapter {
  private readonly logger: Logger;

  protected constructor(
    readonly channel: NotificationChannel,
    private readonly config: AppConfigService,
  ) {
    super();
    this.logger = new Logger(`${channel}Channel`);
  }

  protected abstract destination(message: ChannelMessage): string | undefined;

  send(message: ChannelMessage): Promise<void> {
    if (this.config.isProduction) {
      return Promise.reject(
        new Error(`${this.channel} provider not configured`),
      );
    }
    const target = this.destination(message);
    if (!target) return Promise.reject(new Error('No destination for user'));
    this.logger.log(`[dev] to ${target}: ${message.title} — ${message.body}`);
    return Promise.resolve();
  }
}
