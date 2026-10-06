import { Injectable } from '@nestjs/common';
import type { User } from '../../../generated/prisma/client';
import { AuditService } from '../../audit/audit.service';
import { AppError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import { AccessCache } from '../../rbac/access/access-cache';
import type {
  AuthTokensDto,
  TwoFactorChallengeDto,
} from '../dto/auth-tokens.dto';
import { LockoutService } from '../lockout.service';
import { SessionIssuer, type ClientInfo } from '../sessions/session-issuer';
import { UserAccountRepository } from '../user-account.repository';
import { TwoFactorCodes } from './two-factor-codes';
import { TwoFactorRepository } from './two-factor.repository';

const rejected = () =>
  new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid or expired challenge');

/** Second step of sign-in for accounts with TOTP enabled. */
@Injectable()
export class TwoFactorLoginService {
  constructor(
    private readonly repository: TwoFactorRepository,
    private readonly codes: TwoFactorCodes,
    private readonly users: UserAccountRepository,
    private readonly lockout: LockoutService,
    private readonly access: AccessCache,
    private readonly issuer: SessionIssuer,
    private readonly audit: AuditService,
  ) {}

  async isEnabled(userId: string): Promise<boolean> {
    return !!(await this.repository.find(userId))?.enabledAt;
  }

  /** Password accepted: hand out a challenge instead of tokens. */
  async challenge(
    user: Pick<User, 'id'>,
    client: ClientInfo,
  ): Promise<TwoFactorChallengeDto> {
    await this.repository.pruneChallenges(user.id);
    const { id } = await this.repository.createChallenge({
      userId: user.id,
      platform: client.platform,
      deviceName: client.deviceName?.slice(0, 100) ?? null,
      ip: client.ip ?? null,
      userAgent: client.userAgent ?? null,
    });
    return { twoFactorRequired: true, challengeId: id };
  }

  async verify(
    challengeId: string,
    code: string,
    client: Partial<ClientInfo>,
  ): Promise<AuthTokensDto> {
    const challenge = await this.repository.findChallenge(challengeId);
    if (!challenge) throw rejected();
    const user = await this.users.findById(challenge.userId);
    const record = await this.repository.find(challenge.userId);
    if (!user || !record?.enabledAt) throw rejected();
    this.lockout.assertNotLocked(user);
    // The attempt is spent before the code is checked (no parallel guessing).
    if (!(await this.repository.takeAttempt(challenge.id))) throw rejected();

    const factor = await this.codes.consume(user.id, record.secretEnc, code);
    if (!factor) await this.lockout.registerFailure(user.id, 'Invalid code');
    if (!(await this.repository.consumeChallenge(challenge.id))) {
      throw rejected();
    }
    if (user.status === 'DISABLED') {
      throw new AppError(ErrorCode.ACCOUNT_DISABLED, 'Account is disabled');
    }
    if ((await this.access.assignments(user.id)).length === 0) {
      throw new AppError(ErrorCode.FORBIDDEN, 'No active role assignment');
    }

    await this.users.recordLogin(user.id);
    this.audit.stage({
      action: 'auth.login',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      after: {
        platform: challenge.platform,
        deviceName: challenge.deviceName,
        secondFactor: factor,
      },
    });
    if (factor === 'recovery') {
      this.audit.stage({
        action: 'auth.2fa_recovery_used',
        entityType: 'User',
        entityId: user.id,
        actorId: user.id,
        after: {
          remaining: await this.repository.remainingRecoveryCodes(user.id),
        },
      });
    }
    return this.issuer.start(user, {
      platform: challenge.platform,
      deviceName: challenge.deviceName ?? undefined,
      ip: client.ip ?? challenge.ip ?? undefined,
      userAgent: client.userAgent ?? challenge.userAgent ?? undefined,
    });
  }
}
