import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { NotificationService } from '../../notifications/notification.service';
import { UserAuthPolicyService } from '../policy/user-auth-policy.service';
import { TokenService } from '../token.service';
import { TwoFactorLoginService } from '../two-factor/two-factor-login.service';
import { LoginOtpRepository } from './login-otp.repository';
import {
  generateOtpCode,
  OTP_RESEND_SECONDS,
  OTP_TTL_MS,
  otpHashInput,
} from './otp-code';
import { ParentPhoneService } from './parent-phone.service';

export interface OtpRequestResult {
  ok: true;
  resendAfterSeconds: number;
}

const RESULT: OtpRequestResult = {
  ok: true,
  resendAfterSeconds: OTP_RESEND_SECONDS,
};

/**
 * `POST /auth/otp/request`: always the same answer (no enumeration). A code
 * is only sent to a parent account, at most once per 60 s per phone.
 */
@Injectable()
export class OtpRequestService {
  private readonly logger = new Logger(OtpRequestService.name);

  constructor(
    private readonly phones: ParentPhoneService,
    private readonly repository: LoginOtpRepository,
    private readonly tokens: TokenService,
    private readonly notifications: NotificationService,
    private readonly policies: UserAuthPolicyService,
    private readonly twoFactor: TwoFactorLoginService,
    private readonly config: AppConfigService,
  ) {}

  async request(rawPhone: string): Promise<OtpRequestResult> {
    const phone = this.phones.normalize(rawPhone);
    if (!phone || (await this.inCooldown(phone))) return RESULT;
    const user = await this.phones.findParent(phone);
    if (!user || !(await this.twoFactorReady(user.id))) return RESULT;

    const id = randomUUID();
    const code = generateOtpCode();
    await this.repository.replace({
      id,
      userId: user.id,
      phone,
      codeHash: this.tokens.hash(otpHashInput(id, code)),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    if (!this.config.isProduction) {
      this.logger.log(`[dev] sign-in code for ${user.id}: ${code}`);
    }
    await this.notifications.sendDirect({
      userId: user.id,
      to: { phone },
      channel: 'SMS',
      title: 'eSchool',
      body: `Your sign-in code is ${code}. It expires in 5 minutes. Never share it.`,
    });
    return RESULT;
  }

  private async inCooldown(phone: string): Promise<boolean> {
    const last = await this.repository.lastIssuedAt(phone);
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
