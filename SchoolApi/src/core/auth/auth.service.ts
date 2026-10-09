import { Injectable } from '@nestjs/common';
import type { User } from '../../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { AccessCache } from '../rbac/access/access-cache';
import type { AuthTokensDto, LoginResultDto } from './dto/auth-tokens.dto';
import { parseIdentifier } from './identifier';
import { LockoutService } from './lockout.service';
import { PasswordHasher } from './password/password-hasher';
import { UserAuthPolicyService } from './policy/user-auth-policy.service';
import { RefreshSessionRepository } from './sessions/refresh-session.repository';
import { SessionIssuer, type ClientInfo } from './sessions/session-issuer';
import { SessionsService } from './sessions/sessions.service';
import { TokenService } from './token.service';
import { TwoFactorLoginService } from './two-factor/two-factor-login.service';
import { UserAccountRepository } from './user-account.repository';

export type { ClientInfo } from './sessions/session-issuer';

const IDLE_GRACE_MS = 60_000;

const fail = (code: ErrorCode, message: string, details?: unknown) =>
  new AppError(code, message, details);

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserAccountRepository,
    private readonly sessions: RefreshSessionRepository,
    private readonly sessionsService: SessionsService,
    private readonly tokens: TokenService,
    private readonly hasher: PasswordHasher,
    private readonly lockout: LockoutService,
    private readonly access: AccessCache,
    private readonly audit: AuditService,
    private readonly issuer: SessionIssuer,
    private readonly twoFactor: TwoFactorLoginService,
    private readonly policies: UserAuthPolicyService,
  ) {}

  /**
   * Password step. Accounts with 2FA get a challenge instead of tokens; the
   * failure counter is only reset once the second factor succeeds.
   */
  async login(
    identifier: string,
    password: string,
    client: ClientInfo,
  ): Promise<LoginResultDto> {
    const user = await this.findUser(identifier, password);
    if (!user) {
      await this.hasher.verifyDummy(password);
      throw fail(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials');
    }
    this.lockout.assertNotLocked(user);
    if (!(await this.hasher.verify(user.passwordHash, password))) {
      await this.lockout.registerFailure(user.id);
    }
    if (user.status === 'DISABLED') {
      throw fail(ErrorCode.ACCOUNT_DISABLED, 'Account is disabled');
    }
    if ((await this.access.assignments(user.id)).length === 0) {
      throw fail(ErrorCode.FORBIDDEN, 'No active role assignment');
    }
    if (await this.twoFactor.isEnabled(user.id)) {
      return this.twoFactor.challenge(user, client);
    }

    await this.users.recordLogin(user.id);
    this.audit.stage({
      action: 'auth.login',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      after: { platform: client.platform, deviceName: client.deviceName },
    });
    return this.issuer.start(user, client);
  }

  /**
   * Email, phone or a child's admission number. Both parents may share an
   * admission number: the one whose password matches signs in. Any of them
   * being locked blocks the shared number, so it cannot be guessed around.
   */
  private async findUser(
    identifier: string,
    password: string,
  ): Promise<User | null> {
    const parsed = parseIdentifier(identifier);
    if (!parsed.admissionNo) return this.users.findByIdentifier(parsed);
    const parents = await this.users.findParentsByAdmissionNo(
      parsed.admissionNo,
    );
    if (parents.length <= 1) return parents[0] ?? null;
    parents.forEach((p) => this.lockout.assertNotLocked(p));
    for (const parent of parents) {
      if (await this.hasher.verify(parent.passwordHash, password))
        return parent;
    }
    return parents[0];
  }

  async refresh(
    refreshToken: string,
    client: Partial<ClientInfo>,
  ): Promise<AuthTokensDto> {
    const session = await this.sessions.findByHash(
      this.tokens.hash(refreshToken),
    );
    if (!session)
      throw fail(ErrorCode.UNAUTHENTICATED, 'Invalid refresh token');

    if (session.revokedAt) {
      if (session.replacedById)
        await this.revokeForReuse(session.familyId, session.userId);
      throw fail(ErrorCode.SESSION_REVOKED, 'Session has been revoked');
    }
    if (session.expiresAt <= new Date()) {
      throw fail(ErrorCode.UNAUTHENTICATED, 'Refresh token expired');
    }
    const user = await this.users.findById(session.userId);
    if (!user) throw fail(ErrorCode.UNAUTHENTICATED, 'Invalid refresh token');
    if (user.status === 'DISABLED') {
      throw fail(ErrorCode.ACCOUNT_DISABLED, 'Account is disabled');
    }
    if (session.platform === 'WEB') {
      await this.assertNotIdle(user.id, session.familyId, session.lastUsedAt);
    }

    const token = this.tokens.newOpaqueToken();
    const rotated = await this.sessions.rotate(
      session.id,
      this.issuer.newSession(user.id, session.familyId, token, {
        platform: session.platform,
        deviceName: session.deviceName ?? undefined,
        ip: client.ip ?? session.ip ?? undefined,
        userAgent: client.userAgent ?? session.userAgent ?? undefined,
      }),
    );
    if (!rotated) {
      await this.revokeForReuse(session.familyId, session.userId);
      throw fail(ErrorCode.SESSION_REVOKED, 'Session has been revoked');
    }
    return this.issuer.tokensFor(user, session.familyId, token);
  }

  /** Revokes the current session, and the one of `refreshToken` if it is the user's. */
  async logout(
    user: { id: string; sessionId: string },
    refreshToken?: string,
  ): Promise<void> {
    await this.sessionsService.revokeFamily(user.sessionId);
    if (!refreshToken) return;
    const session = await this.sessions.findByHash(
      this.tokens.hash(refreshToken),
    );
    if (session?.userId === user.id && session.familyId !== user.sessionId) {
      await this.sessionsService.revokeFamily(session.familyId);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionsService.revokeAllForUser(userId, {
      bumpTokenVersion: true,
    });
  }

  /**
   * School sessionTimeoutMinutes for web sessions. Each rotation creates a
   * new row, so the head row's lastUsedAt is the time of the last refresh.
   * Clients only refresh when the access token runs out, so the server can
   * not see idleness shorter than the access TTL (the web UI logs out
   * earlier on its own); one minute of grace absorbs network delay.
   */
  private async assertNotIdle(
    userId: string,
    familyId: string,
    lastUsedAt: Date,
  ): Promise<void> {
    const { sessionTimeoutMinutes } = await this.policies.forUser(userId);
    const limitMs =
      Math.max(sessionTimeoutMinutes * 60, this.tokens.accessTtlSeconds) *
        1000 +
      IDLE_GRACE_MS;
    if (Date.now() - lastUsedAt.getTime() <= limitMs) return;
    await this.sessionsService.revokeFamily(familyId);
    // recordNow: the request fails, so staged entries would be dropped.
    await this.audit.recordNow({
      action: 'auth.session_timeout',
      entityType: 'User',
      entityId: userId,
      actorId: userId,
      after: { familyId, sessionTimeoutMinutes },
    });
    throw fail(ErrorCode.SESSION_REVOKED, 'Session timed out');
  }

  private async revokeForReuse(
    familyId: string,
    userId: string,
  ): Promise<void> {
    await this.sessionsService.revokeFamily(familyId);
    await this.audit.recordNow({
      action: 'auth.refresh_reuse_detected',
      entityType: 'User',
      entityId: userId,
      actorId: userId,
      after: { familyId },
    });
  }
}
