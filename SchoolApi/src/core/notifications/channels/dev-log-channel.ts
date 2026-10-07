import { Logger } from '@nestjs/common';
import type { NotificationChannel } from '../../../generated/prisma/client';
import type { AppConfigService } from '../../../config/app-config.service';
import { ChannelAdapter } from './channel-adapter';
import type { ChannelMessage } from './channel-message';

/**
 * Channel whose provider is "log": logs in development/test and fails in
 * production so the delivery shows up as FAILED (never silently "sent").
 * A staging box with ALLOW_LOG_CHANNELS=true logs instead, without the
 * address or message body (it can hold codes).
 */
export abstract class DevLogChannel extends ChannelAdapter {
  protected readonly logger: Logger;

  protected constructor(
    readonly channel: NotificationChannel,
    protected readonly config: AppConfigService,
  ) {
    super();
    this.logger = new Logger(`${channel}Channel`);
  }

  protected abstract destination(message: ChannelMessage): string | undefined;

  protected logOnly(message: ChannelMessage): Promise<void> {
    const staging = this.config.isProduction;
    if (staging && !this.config.get('ALLOW_LOG_CHANNELS')) {
      return Promise.reject(
        new Error(`${this.channel} provider not configured`),
      );
    }
    const target = this.destination(message);
    if (!target) return Promise.reject(new Error('No destination for user'));
    this.logger.log(
      staging
        ? `[log driver] ${this.channel} for user ${message.userId ?? '-'}: ${message.title}`
        : `[dev] to ${target}: ${message.title} — ${message.body}`,
    );
    return Promise.resolve();
  }

  send(message: ChannelMessage): Promise<void> {
    return this.logOnly(message);
  }
}
