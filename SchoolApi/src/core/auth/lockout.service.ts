import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { lockoutUntil, MAX_FAILED_LOGINS } from './lockout-policy';
import { UserAccountRepository } from './user-account.repository';

/**
 * Account lockout (security.md §1): 5 failures → 15 min. Wrong passwords and
 * wrong second-factor codes share the same counter, so neither can be
 * brute-forced across sessions or challenges.
 */
@Injectable()
export class LockoutService {
  constructor(
    private readonly users: UserAccountRepository,
    private readonly audit: AuditService,
  ) {}

  assertNotLocked(user: { lockedUntil: Date | null }, now = new Date()): void {
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new AppError(
        ErrorCode.ACCOUNT_LOCKED,
        'Account temporarily locked',
        {
          lockedUntil: user.lockedUntil.toISOString(),
        },
      );
    }
  }

  /** Records a failure and throws INVALID_CREDENTIALS or ACCOUNT_LOCKED. */
  async registerFailure(
    userId: string,
    message = 'Invalid credentials',
  ): Promise<never> {
    const failures = await this.users.incrementFailures(userId);
    if (failures >= MAX_FAILED_LOGINS) {
      const until = lockoutUntil(new Date());
      if (await this.users.lock(userId, MAX_FAILED_LOGINS, until)) {
        // recordNow: the request fails, so staged entries would be dropped.
        await this.audit.recordNow({
          action: 'auth.account_locked',
          entityType: 'User',
          entityId: userId,
          actorId: userId,
          after: { lockedUntil: until.toISOString() },
        });
      }
      throw new AppError(ErrorCode.ACCOUNT_LOCKED, 'Too many failed attempts', {
        lockedUntil: until.toISOString(),
      });
    }
    throw new AppError(ErrorCode.INVALID_CREDENTIALS, message);
  }
}
