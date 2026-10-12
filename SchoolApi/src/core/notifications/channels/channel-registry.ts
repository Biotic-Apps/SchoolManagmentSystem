import { Injectable } from '@nestjs/common';
import type { NotificationChannel } from '../../../generated/prisma/client';
import type { ChannelAdapter } from './channel-adapter';
import { EmailChannel } from './email.channel';
import { PushChannel } from './push.channel';
import { SmsChannel } from './sms.channel';
import { WhatsAppChannel } from './whatsapp.channel';

@Injectable()
export class ChannelRegistry {
  private readonly adapters: Map<NotificationChannel, ChannelAdapter>;

  constructor(
    push: PushChannel,
    email: EmailChannel,
    sms: SmsChannel,
    whatsapp: WhatsAppChannel,
  ) {
    this.adapters = new Map<NotificationChannel, ChannelAdapter>(
      [push, email, sms, whatsapp].map((adapter) => [adapter.channel, adapter]),
    );
  }

  get(channel: NotificationChannel): ChannelAdapter {
    const adapter = this.adapters.get(channel);
    if (!adapter) throw new Error(`No adapter for channel ${channel}`);
    return adapter;
  }
}
