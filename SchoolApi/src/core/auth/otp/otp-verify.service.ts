import { Injectable } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';
import { AppError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import type { LoginResultDto } from '../dto/auth-tokens.dto';
import { LockoutService } from '../lockout.service';
import { SessionIssuer, type ClientInfo } from '../sessions/session-issuer';
import { TokenService } from '../token.service';
import { TwoFactorLoginService } from '../two-factor/two-factor-login.service';
import { UserAccountRepository } from '../user-account.repository';
import { LoginOtpRepository } from './login-otp.repository';
import { normalizeOtpCode, otpHashInput, sameHash } from './otp-code';
import { ParentPhoneService } from './parent-phone.service';

const MESSAGE = 'Invalid or expired code';
const rejected = () => new AppError(ErrorCode.INVALID_CREDENTIALS, MESSAGE);

/**
 * `POST /auth/otp/verify`: phone + code → the same LoginResult as the
 * password login. Wrong codes count toward the shared account lockout.
 */
@Injectable()
export class OtpVerifyService {
  constructor(
    private readonly phones: ParentPhoneService,
    private readonly repository: LoginOtpRepository,
    private readonly tokens: TokenService,
    private readonly users: UserAccountRepository,
    private readonly lockout: LockoutService,
    private readonly twoFactor: TwoFactorLoginService,
    private readonly issuer: SessionIssuer,
    private readonly audit: AuditService,
  ) {}

  async verify(
    rawPhone: string,
    rawCode: string,
    client: ClientInfo,
  ): Promise<LoginResultDto> {
    const phone = this.phones.normalize(rawPhone);
    const otp = phone ? await this.repository.findUsable(phone) : null;
    if (!otp) throw rejected();
    const user = await this.users.findById(otp.userId);
    if (!user) throw rejected();
    this.lockout.assertNotLocked(user);
    if (!(await this.repository.takeAttempt(otp.id))) throw rejected();

    const code = normalizeOtpCode(rawCode);
    const hash = code ? this.tokens.hash(otpHashInput(otp.id, code)) : null;
    if (!sameHash(hash, otp.codeHash)) {
      await this.lockout.registerFailure(user.id, MESSAGE);
    }
    if (!(await this.repository.consume(otp.id))) throw rejected();
    if (user.status === 'DISABLED') {
      throw new AppError(ErrorCode.ACCOUNT_DISABLED, 'Account is disabled');
    }
    // The parent role may have been removed since the code was sent.
    if (!(await this.phones.isParent(user.id))) throw rejected();

    if (await this.twoFactor.isEnabled(user.id)) {
      this.audit.stage({
        action: 'auth.otp_verified',
        entityType: 'User',
        entityId: user.id,
        actorId: user.id,
        after: { platform: client.platform, twoFactorRequired: true },
      });
      return this.twoFactor.challenge(user, client);
    }
    await this.users.recordLogin(user.id);
    this.audit.stage({
      action: 'auth.login',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      after: {
        platform: client.platform,
        deviceName: client.deviceName,
        method: 'otp',
      },
    });
    return this.issuer.start(user, client);
  }
}
