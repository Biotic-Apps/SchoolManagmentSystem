import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { toE164 } from '../../common/phone';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';
import { SenderIdentityResolver } from './sender-identity';
import { createSmsSender } from './sms/sms-sender.factory';
import type { SmsSender } from './sms/sms-sender';

/** SMS has no subject line: `Title: body`. */
function smsText({ title, body }: ChannelMessage): string {
  return title && body ? `${title}: ${body}` : body || title;
}

/** SMS_DRIVER=twilio|http sends for real; `log` logs (dev) or fails (production). */
@Injectable()
export class SmsChannel extends DevLogChannel {
  private readonly sender: SmsSender | null;

  constructor(
    config: AppConfigService,
    private readonly identity: SenderIdentityResolver,
  ) {
    super('SMS', config);
    this.sender = createSmsSender(config);
  }

  override async send(message: ChannelMessage): Promise<void> {
    if (!this.sender) return this.logOnly(message);
    if (!message.phone) throw new Error('No phone number for user');
    const to = toE164(message.phone, this.config.get('DEFAULT_PHONE_COUNTRY'));
    if (!to) throw new Error('Phone number is not valid');
    const { senderId } = await this.identity.forUser(message.userId);
    await this.sender.send({ to, message: smsText(message), senderId });
  }

  protected destination(message: ChannelMessage): string | undefined {
    return message.phone ?? undefined;
  }
}
