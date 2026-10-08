import { Injectable, Logger } from '@nestjs/common';
import { ChannelRegistry } from '../../notifications/channels/channel-registry';
import { OTP_TTL_MS } from './otp-code';

const MINUTES = OTP_TTL_MS / 60_000;
export const LOGIN_CODE_SUBJECT = 'Your eSchool sign-in code';

export function loginCodeBody(code: string): string {
  return [
    `Your eSchool sign-in code is: ${code}`,
    '',
    `It is valid for ${MINUTES} minutes. Enter it on the sign-in screen to continue.`,
    '',
    "If you didn't ask for this code, you can ignore this email. Never share this code with anyone.",
  ].join('\n');
}

/**
 * Emails a sign-in code straight through the EMAIL channel (no queue hop,
 * so it arrives right away). Not awaited by the request: the answer and its
 * timing stay the same whether or not an email goes out. Failures are
 * logged without the code.
 */
@Injectable()
export class LoginCodeMailer {
  private readonly logger = new Logger(LoginCodeMailer.name);

  constructor(private readonly channels: ChannelRegistry) {}

  send(userId: string, email: string, code: string): void {
    this.channels
      .get('EMAIL')
      .send({
        userId,
        email,
        title: LOGIN_CODE_SUBJECT,
        body: loginCodeBody(code),
      })
      .catch((error: unknown) => {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Sign-in code email to user ${userId} failed: ${reason}`,
        );
      });
  }
}
