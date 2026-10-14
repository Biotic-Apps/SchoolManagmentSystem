import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { toE164 } from '../../common/phone';
import { PrismaService } from '../../prisma/prisma.service';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';
import { SenderIdentityResolver } from './sender-identity';
import { createSmsSender } from './sms/sms-sender.factory';
import type { OutgoingSms, SmsSender } from './sms/sms-sender';

/** SMS has no subject line: `Title: body`. */
function smsText({ title, body }: ChannelMessage): string {
  return title && body ? `${title}: ${body}` : body || title;
}

/** SMS_DRIVER=twilio|http|android-relay sends for real; `log` logs (dev) or fails (production). */
@Injectable()
export class SmsChannel extends DevLogChannel {
  private readonly sender: SmsSender | null;
  private readonly isAndroidRelay: boolean;

  constructor(
    config: AppConfigService,
    private readonly identity: SenderIdentityResolver,
    private readonly prisma: PrismaService,
  ) {
    super('SMS', config);
    this.sender = createSmsSender(config, prisma);
    this.isAndroidRelay = config.get('SMS_DRIVER') === 'android-relay';
  }

  override async send(message: ChannelMessage): Promise<void> {
    if (!this.sender) return this.logOnly(message);
    if (!message.phone) throw new Error('No phone number for user');
    const to = toE164(message.phone, this.config.get('DEFAULT_PHONE_COUNTRY'));
    if (!to) throw new Error('Phone number is not valid');
    const { senderId, schoolId } = await this.identity.forUser(message.userId);
    const sms: OutgoingSms & { schoolId?: string } = {
      to,
      message: smsText(message),
      senderId,
    };
    if (this.isAndroidRelay && schoolId) sms.schoolId = schoolId;
    await this.sender.send(sms);
  }

  protected destination(message: ChannelMessage): string | undefined {
    return message.phone ?? undefined;
  }
}
