import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ClientPlatform, User } from '../../generated/prisma/client';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { AccessCache } from '../rbac/access/access-cache';
import { AuthStateCache } from './auth-state.cache';
import type { AuthTokensDto } from './dto/auth-tokens.dto';
import { parseIdentifier } from './identifier';
import { lockoutUntil, MAX_FAILED_LOGINS } from './lockout-policy';
import { PasswordHasher } from './password/password-hasher';
import {
  RefreshSessionRepository,
  type NewSession,
} from './sessions/refresh-session.repository';
import { SessionsService } from './sessions/sessions.service';
import { TokenService } from './token.service';
import { UserAccountRepository } from './user-account.repository';

export interface ClientInfo {
  platform: ClientPlatform;
  deviceName?: string;
  ip?: string;
  userAgent?: string;
}

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
    private readonly state: AuthStateCache,
    private readonly access: AccessCache,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
  ) {}

  async login(
    identifier: string,
    password: string,
    client: ClientInfo,
  ): Promise<AuthTokensDto> {
    const user = await this.users.findByIdentifier(parseIdentifier(identifier));
    if (!user) {
      await this.hasher.verifyDummy(password);
      throw fail(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials');
    }
    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      throw fail(ErrorCode.ACCOUNT_LOCKED, 'Account temporarily locked', {
        lockedUntil: user.lockedUntil.toISOString(),
      });
    }
    if (!(await this.hasher.verify(user.passwordHash, password))) {
      await this.registerFailure(user, now);
    }
    if (user.status === 'DISABLED') {
      throw fail(ErrorCode.ACCOUNT_DISABLED, 'Account is disabled');
    }
    if ((await this.access.assignments(user.id)).length === 0) {
      throw fail(ErrorCode.FORBIDDEN, 'No active role assignment');
    }

    await this.users.recordLogin(user.id);
    this.audit.stage({
      action: 'auth.login',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      after: { platform: client.platform, deviceName: client.deviceName },
    });
    return this.startSession(user, randomUUID(), client);
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

    const token = this.tokens.newOpaqueToken();
    const rotated = await this.sessions.rotate(
      session.id,
      this.newSession(user.id, session.familyId, token, {
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
    return this.tokensFor(user, session.familyId, token);
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

  private async registerFailure(user: User, now: Date): Promise<never> {
    const failures = user.failedLoginCount + 1;
    if (failures >= MAX_FAILED_LOGINS) {
      const until = lockoutUntil(now);
      await this.users.recordFailure(user.id, 0, until);
      throw fail(ErrorCode.ACCOUNT_LOCKED, 'Too many failed attempts', {
        lockedUntil: until.toISOString(),
      });
    }
    await this.users.recordFailure(user.id, failures, null);
    throw fail(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials');
  }

  private async revokeForReuse(
    familyId: string,
    userId: string,
  ): Promise<void> {
    await this.sessionsService.revokeFamily(familyId);
    this.audit.stage({
      action: 'auth.refresh_reuse_detected',
      entityType: 'User',
      entityId: userId,
      actorId: userId,
      after: { familyId },
    });
  }

  private async startSession(
    user: User,
    familyId: string,
    client: ClientInfo,
  ): Promise<AuthTokensDto> {
    const token = this.tokens.newOpaqueToken();
    await this.sessions.create(
      this.newSession(user.id, familyId, token, client),
    );
    await this.state.invalidateUser(user.id);
    return this.tokensFor(user, familyId, token);
  }

  private newSession(
    userId: string,
    familyId: string,
    token: string,
    client: ClientInfo,
  ): NewSession {
    const days = this.config.get('REFRESH_TTL_DAYS');
    return {
      userId,
      familyId,
      tokenHash: this.tokens.hash(token),
      deviceName: client.deviceName?.slice(0, 100) ?? null,
      platform: client.platform,
      ip: client.ip ?? null,
      userAgent: client.userAgent ?? null,
      expiresAt: new Date(Date.now() + days * 86_400_000),
    };
  }

  private async tokensFor(
    user: User,
    familyId: string,
    refreshToken: string,
  ): Promise<AuthTokensDto> {
    const accessToken = await this.tokens.signAccess({
      sub: user.id,
      sid: familyId,
      ver: user.tokenVersion,
    });
    return {
      accessToken,
      refreshToken,
      accessExpiresIn: this.tokens.accessTtlSeconds,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
