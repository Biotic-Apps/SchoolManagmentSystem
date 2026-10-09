import { createTransport, type Transporter } from 'nodemailer';
import type { Env } from '../../../../config/env.schema';
import { errorText, providerError } from '../provider-error';
import { emailFrom } from './email-from';
import type { EmailSender, OutgoingEmail } from './email-sender';

type SmtpEnv = Pick<
  Env,
  | 'SMTP_HOST'
  | 'SMTP_PORT'
  | 'SMTP_SECURE'
  | 'SMTP_USER'
  | 'SMTP_PASSWORD'
  | 'EMAIL_FROM'
>;

export function smtpTransport(env: SmtpEnv): Transporter {
  return createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // false = plain connection upgraded with STARTTLS (required, not optional).
    secure: env.SMTP_SECURE,
    requireTLS: !env.SMTP_SECURE,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

/** EMAIL_DRIVER=smtp (nodemailer). */
export class SmtpEmailSender implements EmailSender {
  constructor(
    private readonly env: SmtpEnv,
    private readonly transport: Pick<
      Transporter,
      'sendMail' | 'verify'
    > = smtpTransport(env),
  ) {}

  async send(email: OutgoingEmail): Promise<void> {
    try {
      await this.transport.sendMail({
        from: emailFrom(this.env.EMAIL_FROM!, email.fromName),
        to: email.to,
        subject: email.subject,
        text: email.text,
        ...(email.html ? { html: email.html } : {}),
      });
    } catch (error) {
      throw this.sanitised(error);
    }
  }

  async verify(): Promise<void> {
    try {
      await this.transport.verify();
    } catch (error) {
      throw this.sanitised(error);
    }
  }

  private sanitised(error: unknown): Error {
    return providerError(`SMTP: ${errorText(error)}`, [
      this.env.SMTP_PASSWORD,
      this.env.SMTP_USER,
    ]);
  }
}
