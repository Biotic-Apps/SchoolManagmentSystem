import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';
import { createEmailSender } from './email/email-sender.factory';
import type { EmailSender } from './email/email-sender';
import { SenderIdentityResolver } from './sender-identity';

/** EMAIL_DRIVER=smtp sends for real; `log` logs (dev) or fails (production). */
@Injectable()
export class EmailChannel extends DevLogChannel {
  private readonly sender: EmailSender | null;

  constructor(
    config: AppConfigService,
    private readonly identity: SenderIdentityResolver,
  ) {
    super('EMAIL', config);
    this.sender = createEmailSender(config);
  }

  override async send(message: ChannelMessage): Promise<void> {
    if (!this.sender) return this.logOnly(message);
    const to = message.email?.trim();
    if (!to) throw new Error('No email address for user');
    const { fromName } = await this.identity.forUser(message.userId);
    await this.sender.send({
      to,
      subject: message.title,
      text: message.body,
      fromName,
    });
  }

  protected destination(message: ChannelMessage): string | undefined {
    return message.email ?? undefined;
  }
}
