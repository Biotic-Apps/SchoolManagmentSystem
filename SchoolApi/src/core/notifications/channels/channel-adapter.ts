import type { NotificationChannel } from '../../../generated/prisma/client';
import type { ChannelMessage } from './channel-message';

/** Delivers one message over one external channel (push, email, SMS). */
export abstract class ChannelAdapter {
  abstract readonly channel: NotificationChannel;
  abstract send(message: ChannelMessage): Promise<void>;
}
