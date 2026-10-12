import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { toE164 } from '../../common/phone';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';
import { createWhatsAppSender } from './whatsapp/whatsapp-sender.factory';
import type { WhatsAppSender } from './whatsapp/whatsapp-sender';

/** WhatsApp has no subject line: `Title: body`. */
function whatsappText({ title, body }: ChannelMessage): string {
  return title && body ? `${title}: ${body}` : body || title;
}

/** WHATSAPP_DRIVER=twilio|http sends for real; `log` logs (dev) or fails (production). */
@Injectable()
export class WhatsAppChannel extends DevLogChannel {
  private readonly sender: WhatsAppSender | null;

  constructor(config: AppConfigService) {
    super('WHATSAPP', config);
    this.sender = createWhatsAppSender(config);
  }

  override async send(message: ChannelMessage): Promise<void> {
    if (!this.sender) return this.logOnly(message);
    if (!message.phone) throw new Error('No phone number for user');
    const to = toE164(message.phone, this.config.get('DEFAULT_PHONE_COUNTRY'));
    if (!to) throw new Error('Phone number is not valid');
    await this.sender.send({ to, message: whatsappText(message) });
  }

  protected destination(message: ChannelMessage): string | undefined {
    return message.phone ?? undefined;
  }
}
