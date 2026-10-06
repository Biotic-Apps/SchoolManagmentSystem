import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { AuditService } from '../../audit/audit.service';
import { AppError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import { conflict, forbidden } from '../../common/errors/errors';
import type { AuthUser } from '../../common/types/auth-user';
import { AuthStateCache } from '../auth-state.cache';
import { LockoutService } from '../lockout.service';
import { PasswordHasher } from '../password/password-hasher';
import { UserAuthPolicyService } from '../policy/user-auth-policy.service';
import { SessionsService } from '../sessions/sessions.service';
import { UserAccountRepository } from '../user-account.repository';
import type { RecoveryCodesDto, TwoFactorSetupDto } from './dto/two-factor.dto';
import { generateTotpSecret, matchTotpStep, otpauthUrl } from './totp';
import { TwoFactorCodes } from './two-factor-codes';
import { TwoFactorRepository } from './two-factor.repository';

const invalidCode = () =>
  new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid code');

/** Self-service TOTP management (phase5-contract §B). */
@Injectable()
export class TwoFactorService {
  constructor(
    private readonly repository: TwoFactorRepository,
    private readonly codes: TwoFactorCodes,
    private readonly users: UserAccountRepository,
    private readonly hasher: PasswordHasher,
    private readonly lockout: LockoutService,
    private readonly sessions: SessionsService,
    private readonly state: AuthStateCache,
    private readonly policies: UserAuthPolicyService,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
  ) {}

  async setup(userId: string): Promise<TwoFactorSetupDto> {
    const existing = await this.repository.find(userId);
    if (existing?.enabledAt) throw conflict('Two-factor sign-in is already on');
    const user = await this.users.findById(userId);
    if (!user)
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');

    const secret = generateTotpSecret();
    await this.repository.savePending(userId, this.codes.encrypt(secret));
    const account = user.email ?? user.phone ?? user.id;
    return {
      otpauthUrl: otpauthUrl(this.config.get('TOTP_ISSUER'), account, secret),
      secret,
    };
  }

  async enable(user: AuthUser, code: string): Promise<RecoveryCodesDto> {
    const record = await this.repository.find(user.id);
    if (record?.enabledAt) throw conflict('Two-factor sign-in is already on');
    if (!record) throw conflict('Start the setup first');

    const step = matchTotpStep(this.codes.decrypt(record.secretEnc), code);
    if (step === null) throw invalidCode();
    const { codes, hashes } = this.codes.newRecoveryCodes(user.id);
    if (!(await this.repository.enable(user.id, step, hashes))) {
      throw conflict('Two-factor sign-in is already on');
    }
    await this.sessions.revokeAllForUser(user.id, {
      exceptFamilyId: user.sessionId,
    });
    await this.changed(user.id);
    this.audit.stage({
      action: 'auth.2fa_enabled',
      entityType: 'User',
      entityId: user.id,
    });
    return { recoveryCodes: codes };
  }

  async disable(userId: string, password: string, code: string) {
    const record = await this.enabledRecord(userId);
    const user = await this.users.findById(userId);
    if (!user)
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');
    this.lockout.assertNotLocked(user);
    if (!(await this.hasher.verify(user.passwordHash, password))) {
      await this.lockout.registerFailure(userId);
    }
    await this.policies.invalidateUser(userId);
    if (await this.policies.twoFactorRequired(userId)) {
      throw forbidden('Two-factor sign-in is required for your role');
    }
    const used = await this.codes.consume(userId, record.secretEnc, code);
    if (!used) await this.lockout.registerFailure(userId, 'Invalid code');

    await this.repository.remove(userId);
    await this.changed(userId);
    this.audit.stage({
      action: 'auth.2fa_disabled',
      entityType: 'User',
      entityId: userId,
      after: { factor: used },
    });
  }

  async regenerateRecoveryCodes(
    userId: string,
    code: string,
  ): Promise<RecoveryCodesDto> {
    const record = await this.enabledRecord(userId);
    const user = await this.users.findById(userId);
    if (!user)
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');
    this.lockout.assertNotLocked(user);
    const used = await this.codes.consume(userId, record.secretEnc, code);
    if (!used) await this.lockout.registerFailure(userId, 'Invalid code');

    const { codes, hashes } = this.codes.newRecoveryCodes(userId);
    await this.repository.replaceRecoveryCodes(userId, hashes);
    this.audit.stage({
      action: 'auth.2fa_recovery_regenerated',
      entityType: 'User',
      entityId: userId,
    });
    return { recoveryCodes: codes };
  }

  async status(userId: string) {
    const [record, required] = await Promise.all([
      this.repository.find(userId),
      this.policies.twoFactorRequired(userId),
    ]);
    return { enabled: !!record?.enabledAt, required };
  }

  private async enabledRecord(userId: string) {
    const record = await this.repository.find(userId);
    if (!record?.enabledAt) throw conflict('Two-factor sign-in is off');
    return record;
  }

  private async changed(userId: string): Promise<void> {
    await this.state.invalidateUser(userId);
    await this.policies.invalidateUser(userId);
  }
}
