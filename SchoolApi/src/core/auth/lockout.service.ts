import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { lockoutUntil, MAX_FAILED_LOGINS } from './lockout-policy';
import { UserAccountRepository } from './user-account.repository';

/**
 * Account lockout (security.md §1): 5 failures → 15 min. Wrong passwords and
 * wrong 2FA codes (only reachable after a correct first factor) share the same
 * counter. Email sign-in codes do NOT count here: they have their own
 * per-email limit (otp-code.ts), so knowing an email cannot lock an account.
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
