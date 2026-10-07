import type { AppConfigService } from '../../../../config/app-config.service';
import type { EmailSender } from './email-sender';
import { SmtpEmailSender } from './smtp-email-sender';

/** The configured email provider, or null for EMAIL_DRIVER=log. */
export function createEmailSender(
  config: AppConfigService,
): EmailSender | null {
  if (config.get('EMAIL_DRIVER') !== 'smtp') return null;
  return new SmtpEmailSender({
    SMTP_HOST: config.get('SMTP_HOST'),
    SMTP_PORT: config.get('SMTP_PORT'),
    SMTP_SECURE: config.get('SMTP_SECURE'),
    SMTP_USER: config.get('SMTP_USER'),
    SMTP_PASSWORD: config.get('SMTP_PASSWORD'),
    EMAIL_FROM: config.get('EMAIL_FROM'),
  });
}
