import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { UserAuthPolicyService } from '../policy/user-auth-policy.service';
import { TokenService } from '../token.service';
import { TwoFactorLoginService } from '../two-factor/two-factor-login.service';
import { LoginCodeMailer } from './login-code-mailer';
import { LoginOtpRepository } from './login-otp.repository';
import {
  generateOtpCode,
  OTP_RESEND_SECONDS,
  OTP_TTL_MS,
  otpHashInput,
} from './otp-code';
import { ParentEmailService } from './parent-email.service';

export interface OtpRequestResult {
  ok: true;
  resendAfterSeconds: number;
  /** Local development only (OTP_DEV_ECHO with the log email driver). */
  devCode?: string;
}

const RESULT: OtpRequestResult = {
  ok: true,
  resendAfterSeconds: OTP_RESEND_SECONDS,
};

/**
 * `POST /auth/otp/request`: always the same answer (no enumeration). A code
 * is only emailed to a parent account, at most once per 60 s per address.
 */
@Injectable()
export class OtpRequestService {
  private readonly logger = new Logger(OtpRequestService.name);

  constructor(
    private readonly emails: ParentEmailService,
    private readonly repository: LoginOtpRepository,
    private readonly tokens: TokenService,
    private readonly mailer: LoginCodeMailer,
    private readonly policies: UserAuthPolicyService,
    private readonly twoFactor: TwoFactorLoginService,
    private readonly config: AppConfigService,
  ) {}

  async request(rawEmail: string): Promise<OtpRequestResult> {
    const email = this.emails.normalize(rawEmail);
    if (!email || (await this.inCooldown(email))) return RESULT;
    const user = await this.emails.findParent(email);
    if (!user?.email || !(await this.twoFactorReady(user.id))) return RESULT;

    const id = randomUUID();
    const code = generateOtpCode();
    await this.repository.replace({
      id,
      userId: user.id,
      email,
      codeHash: this.tokens.hash(otpHashInput(id, code)),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    if (!this.config.isProduction) {
      this.logger.log(`[dev] sign-in code for ${user.id}: ${code}`);
    }
    // The stored address (not the typed one) receives the code.
    this.mailer.send(user.id, user.email, code);
    return this.echoesCode() ? { ...RESULT, devCode: code } : RESULT;
  }

  /** Never in production; only when emails are just logged and the flag is on. */
  private echoesCode(): boolean {
    return (
      !this.config.isProduction &&
      this.config.get('EMAIL_DRIVER') === 'log' &&
      this.config.get('OTP_DEV_ECHO')
    );
  }

  private async inCooldown(email: string): Promise<boolean> {
    const last = await this.repository.lastIssuedAt(email);
    return !!last && Date.now() - last.getTime() < OTP_RESEND_SECONDS * 1000;
  }

  /**
   * A parent whose school requires 2FA but who has not set it up would be
   * stopped right after sign-in, so no code is sent (they use the password).
   */
  private async twoFactorReady(userId: string): Promise<boolean> {
    if (await this.twoFactor.isEnabled(userId)) return true;
    return !(await this.policies.twoFactorRequired(userId));
  }
}
