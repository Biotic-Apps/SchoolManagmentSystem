import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';
import { renderEmailHtml } from './email/email-html';
import { createEmailSender } from './email/email-sender.factory';
import type { EmailSender } from './email/email-sender';
import { SenderIdentityResolver } from './sender-identity';

/** EMAIL_DRIVER=smtp sends for real; `log` logs (dev) or fails (production). */
@Injectable()
export class EmailChannel
  extends DevLogChannel
  implements OnApplicationBootstrap
{
  private readonly sender: EmailSender | null;

  constructor(
    config: AppConfigService,
    private readonly identity: SenderIdentityResolver,
  ) {
    super('EMAIL', config);
    this.sender = createEmailSender(config);
  }

  /** Checks the SMTP login at start-up; a bad setting is logged, never fatal. */
  onApplicationBootstrap(): void {
    void this.verify();
  }

  async verify(): Promise<boolean> {
    if (!this.sender) return false;
    try {
      await this.sender.verify();
      this.logger.log('SMTP connection verified; emails will be delivered');
      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `SMTP check failed, emails will not be delivered until fixed (SMTP_HOST/SMTP_USER/SMTP_PASSWORD): ${reason}`,
      );
      return false;
    }
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
      html: renderEmailHtml({
        schoolName: fromName?.trim() || 'eSchool',
        title: message.title,
        body: message.body,
        extras: message.extras,
      }),
      fromName,
    });
  }

  protected destination(message: ChannelMessage): string | undefined {
    return message.email ?? undefined;
  }
}
