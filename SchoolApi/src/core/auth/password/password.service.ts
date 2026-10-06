import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { AuditService } from '../../audit/audit.service';
import { invalid } from '../../common/errors/errors';
import { AppError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import { NotificationService } from '../../notifications/notification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthStateCache } from '../auth-state.cache';
import { parseIdentifier } from '../identifier';
import { SessionsService } from '../sessions/sessions.service';
import { TokenService } from '../token.service';
import { LockoutService } from '../lockout.service';
import { UserAccountRepository } from '../user-account.repository';
import { PasswordHasher } from './password-hasher';
import { PasswordPolicyService } from './password-policy.service';

const RESET_TTL_MINUTES = 30;

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UserAccountRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly sessions: SessionsService,
    private readonly state: AuthStateCache,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
    private readonly policy: PasswordPolicyService,
    private readonly lockout: LockoutService,
  ) {}

  /** Always succeeds from the caller's view (no user enumeration). */
  async forgot(identifier: string): Promise<void> {
    const user = await this.users.findByIdentifier(parseIdentifier(identifier));
    if (!user || user.status !== 'ACTIVE') return;

    const token = this.tokens.newOpaqueToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.tokens.hash(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
      },
    });
    if (!this.config.isProduction) {
      this.logger.log(`[dev] password reset token for ${user.id}: ${token}`);
    }
    await this.notifications.sendDirect({
      userId: user.id,
      channel: user.email ? 'EMAIL' : 'SMS',
      title: 'Reset your eSchool password',
      body: `Use this code to reset your password (valid ${RESET_TTL_MINUTES} minutes): ${token}`,
    });
  }

  async reset(token: string, newPassword: string): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.tokens.hash(token) },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      throw invalid('Invalid or expired reset token');
    }
    // Checked before the token is claimed so a rejected password can be retried.
    await this.policy.assertForUser(record.userId, newPassword);
    const claimed = await this.prisma.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) throw invalid('Invalid or expired reset token');

    const hash = await this.hasher.hash(newPassword);
    await this.users.setPassword(record.userId, hash, {
      mustChangePassword: false,
      bumpTokenVersion: true,
    });
    await this.sessions.revokeAllForUser(record.userId);
    this.audit.stage({
      action: 'auth.password_reset',
      entityType: 'User',
      entityId: record.userId,
      actorId: record.userId,
    });
  }

  async change(
    userId: string,
    currentFamilyId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        'Current password is incorrect',
      );
    }
    // A stolen access token must not allow guessing the password: wrong
    // current passwords count toward the account lockout (security.md §1).
    this.lockout.assertNotLocked(user);
    if (!(await this.hasher.verify(user.passwordHash, currentPassword))) {
      await this.lockout.registerFailure(
        userId,
        'Current password is incorrect',
      );
    }
    await this.policy.assertForUser(userId, newPassword);
    if (currentPassword === newPassword) {
      throw invalid('New password must differ from the current one');
    }
    const hash = await this.hasher.hash(newPassword);
    await this.users.setPassword(userId, hash, {
      mustChangePassword: false,
      bumpTokenVersion: false,
    });
    await this.sessions.revokeAllForUser(userId, {
      exceptFamilyId: currentFamilyId,
    });
    await this.state.invalidateUser(userId);
    this.audit.stage({
      action: 'auth.password_change',
      entityType: 'User',
      entityId: userId,
    });
  }
}
