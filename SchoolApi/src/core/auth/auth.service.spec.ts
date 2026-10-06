import type { User } from '../../generated/prisma/client';
import type { AppConfigService } from '../../config/app-config.service';
import type { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../common/errors/error-code.enum';
import type { AccessCache } from '../rbac/access/access-cache';
import type { AuthStateCache } from './auth-state.cache';
import { AuthService } from './auth.service';
import type { AuthTokensDto } from './dto/auth-tokens.dto';
import { LockoutService } from './lockout.service';
import type { PasswordHasher } from './password/password-hasher';
import type { UserAuthPolicyService } from './policy/user-auth-policy.service';
import type { RefreshSessionRepository } from './sessions/refresh-session.repository';
import { SessionIssuer } from './sessions/session-issuer';
import type { SessionsService } from './sessions/sessions.service';
import type { TokenService } from './token.service';
import type { TwoFactorLoginService } from './two-factor/two-factor-login.service';
import type { UserAccountRepository } from './user-account.repository';

const user = (overrides: Partial<User> = {}): User =>
  ({
    id: 'u1',
    status: 'ACTIVE',
    tokenVersion: 3,
    mustChangePassword: false,
    failedLoginCount: 0,
    lockedUntil: null,
    passwordHash: 'hash',
    ...overrides,
  }) as User;

const session = (overrides = {}) => ({
  id: 's1',
  userId: 'u1',
  familyId: 'fam1',
  platform: 'WEB',
  deviceName: null,
  ip: null,
  userAgent: null,
  revokedAt: null as Date | null,
  replacedById: null as string | null,
  lastUsedAt: new Date(),
  expiresAt: new Date(Date.now() + 60_000),
  ...overrides,
});

function setup() {
  const users = {
    findByIdentifier: jest.fn(),
    findById: jest.fn(),
    incrementFailures: jest.fn(),
    lock: jest.fn().mockResolvedValue(true),
    recordLogin: jest.fn(),
  };
  const sessions = {
    findByHash: jest.fn(),
    rotate: jest.fn(),
    create: jest.fn(),
  };
  const sessionsService = {
    revokeFamily: jest.fn(),
    revokeAllForUser: jest.fn(),
  };
  const tokens = {
    hash: (t: string) => `h:${t}`,
    newOpaqueToken: () => 'new-token',
    signAccess: jest.fn().mockResolvedValue('jwt'),
    accessTtlSeconds: 900,
  };
  const hasher = { verify: jest.fn(), verifyDummy: jest.fn() };
  const access = { assignments: jest.fn().mockResolvedValue([{ id: 'a1' }]) };
  const audit = { stage: jest.fn(), recordNow: jest.fn() };
  const twoFactor = {
    isEnabled: jest.fn().mockResolvedValue(false),
    challenge: jest
      .fn()
      .mockResolvedValue({ twoFactorRequired: true, challengeId: 'c1' }),
  };
  const policies = {
    forUser: jest.fn().mockResolvedValue({ sessionTimeoutMinutes: 30 }),
  };
  const issuer = new SessionIssuer(
    sessions as unknown as RefreshSessionRepository,
    tokens as unknown as TokenService,
    { invalidateUser: jest.fn() } as unknown as AuthStateCache,
    { get: () => 30 } as unknown as AppConfigService,
  );
  const service = new AuthService(
    users as unknown as UserAccountRepository,
    sessions as unknown as RefreshSessionRepository,
    sessionsService as unknown as SessionsService,
    tokens as unknown as TokenService,
    hasher as unknown as PasswordHasher,
    new LockoutService(
      users as unknown as UserAccountRepository,
      audit as unknown as AuditService,
    ),
    access as unknown as AccessCache,
    audit as unknown as AuditService,
    issuer,
    twoFactor as unknown as TwoFactorLoginService,
    policies as unknown as UserAuthPolicyService,
  );
  return {
    service,
    users,
    sessions,
    sessionsService,
    hasher,
    twoFactor,
    policies,
    audit,
  };
}

const codeOf = (promise: Promise<unknown>) =>
  promise.then(
    () => 'resolved',
    (error: { code?: string }) => error.code,
  );

describe('AuthService', () => {
  describe('refresh', () => {
    it('rotates the token within the same family', async () => {
      const { service, users, sessions } = setup();
      sessions.findByHash.mockResolvedValue(session());
      users.findById.mockResolvedValue(user());
      sessions.rotate.mockResolvedValue(true);

      const result = await service.refresh('old-token', {});

      expect(result).toMatchObject({
        accessToken: 'jwt',
        refreshToken: 'new-token',
        accessExpiresIn: 900,
      });
      expect(sessions.rotate).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({ familyId: 'fam1', tokenHash: 'h:new-token' }),
      );
    });

    it('revokes the whole family when a rotated token is reused', async () => {
      const { service, sessions, sessionsService, audit } = setup();
      sessions.findByHash.mockResolvedValue(
        session({ revokedAt: new Date(), replacedById: 's2' }),
      );

      expect(await codeOf(service.refresh('old-token', {}))).toBe(
        ErrorCode.SESSION_REVOKED,
      );
      expect(sessionsService.revokeFamily).toHaveBeenCalledWith('fam1');
      expect(sessions.rotate).not.toHaveBeenCalled();
      // Written at once: the failing request would drop staged entries.
      expect(audit.recordNow).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'auth.refresh_reuse_detected' }),
      );
    });

    it('treats a lost rotation race as reuse', async () => {
      const { service, users, sessions, sessionsService } = setup();
      sessions.findByHash.mockResolvedValue(session());
      users.findById.mockResolvedValue(user());
      sessions.rotate.mockResolvedValue(false);

      expect(await codeOf(service.refresh('old-token', {}))).toBe(
        ErrorCode.SESSION_REVOKED,
      );
      expect(sessionsService.revokeFamily).toHaveBeenCalledWith('fam1');
    });

    it('rejects disabled users', async () => {
      const { service, users, sessions } = setup();
      sessions.findByHash.mockResolvedValue(session());
      users.findById.mockResolvedValue(user({ status: 'DISABLED' }));

      expect(await codeOf(service.refresh('t', {}))).toBe(
        ErrorCode.ACCOUNT_DISABLED,
      );
    });
  });

  describe('login lockout', () => {
    it('counts a failed attempt', async () => {
      const { service, users, hasher } = setup();
      users.findByIdentifier.mockResolvedValue(user({ failedLoginCount: 2 }));
      users.incrementFailures.mockResolvedValue(3);
      hasher.verify.mockResolvedValue(false);

      expect(
        await codeOf(service.login('a@b.c', 'bad', { platform: 'WEB' })),
      ).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(users.incrementFailures).toHaveBeenCalledWith('u1');
      expect(users.lock).not.toHaveBeenCalled();
    });

    it('locks the account on the fifth failure', async () => {
      const { service, users, hasher } = setup();
      users.findByIdentifier.mockResolvedValue(user({ failedLoginCount: 4 }));
      users.incrementFailures.mockResolvedValue(5);
      hasher.verify.mockResolvedValue(false);

      expect(
        await codeOf(service.login('a@b.c', 'bad', { platform: 'WEB' })),
      ).toBe(ErrorCode.ACCOUNT_LOCKED);
      const [, threshold, until] = users.lock.mock.calls[0] as [
        string,
        number,
        Date,
      ];
      expect(threshold).toBe(5);
      expect(until.getTime() - Date.now()).toBeGreaterThan(14 * 60_000);
    });

    it('refuses a locked account without checking the password', async () => {
      const { service, users, hasher } = setup();
      users.findByIdentifier.mockResolvedValue(
        user({ lockedUntil: new Date(Date.now() + 60_000) }),
      );

      expect(
        await codeOf(service.login('a@b.c', 'right', { platform: 'WEB' })),
      ).toBe(ErrorCode.ACCOUNT_LOCKED);
      expect(hasher.verify).not.toHaveBeenCalled();
    });

    it('hides unknown accounts behind INVALID_CREDENTIALS', async () => {
      const { service, users, hasher } = setup();
      users.findByIdentifier.mockResolvedValue(null);

      expect(
        await codeOf(service.login('x@y.z', 'pw', { platform: 'WEB' })),
      ).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(hasher.verifyDummy).toHaveBeenCalled();
    });

    it('resets the counter and opens a session on success', async () => {
      const { service, users, hasher, sessions } = setup();
      users.findByIdentifier.mockResolvedValue(user({ failedLoginCount: 3 }));
      hasher.verify.mockResolvedValue(true);

      const tokens = await service.login('a@b.c', 'right', {
        platform: 'ANDROID',
      });

      expect(users.recordLogin).toHaveBeenCalledWith('u1');
      expect(sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'ANDROID',
          tokenHash: 'h:new-token',
        }),
      );
      expect((tokens as AuthTokensDto).mustChangePassword).toBe(false);
    });

    it('returns a 2FA challenge without resetting the counter', async () => {
      const { service, users, hasher, sessions, twoFactor } = setup();
      users.findByIdentifier.mockResolvedValue(user({ failedLoginCount: 3 }));
      hasher.verify.mockResolvedValue(true);
      twoFactor.isEnabled.mockResolvedValue(true);

      const result = await service.login('a@b.c', 'right', {
        platform: 'WEB',
      });

      expect(result).toEqual({ twoFactorRequired: true, challengeId: 'c1' });
      expect(users.recordLogin).not.toHaveBeenCalled();
      expect(sessions.create).not.toHaveBeenCalled();
    });

    it('never reaches the 2FA step with a wrong password', async () => {
      const { service, users, hasher, twoFactor } = setup();
      users.findByIdentifier.mockResolvedValue(user());
      users.incrementFailures.mockResolvedValue(1);
      hasher.verify.mockResolvedValue(false);
      twoFactor.isEnabled.mockResolvedValue(true);

      expect(
        await codeOf(service.login('a@b.c', 'bad', { platform: 'WEB' })),
      ).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(twoFactor.challenge).not.toHaveBeenCalled();
    });
  });

  describe('web idle timeout', () => {
    it('revokes a web session idle longer than the school timeout', async () => {
      const { service, users, sessions, sessionsService, audit } = setup();
      sessions.findByHash.mockResolvedValue(
        session({ lastUsedAt: new Date(Date.now() - 32 * 60_000) }),
      );
      users.findById.mockResolvedValue(user());

      expect(await codeOf(service.refresh('t', {}))).toBe(
        ErrorCode.SESSION_REVOKED,
      );
      expect(sessionsService.revokeFamily).toHaveBeenCalledWith('fam1');
      expect(sessions.rotate).not.toHaveBeenCalled();
      expect(audit.recordNow).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'auth.session_timeout' }),
      );
    });

    it('never limits below the access-token lifetime', async () => {
      const { service, users, sessions, policies } = setup();
      policies.forUser.mockResolvedValue({ sessionTimeoutMinutes: 5 });
      sessions.findByHash.mockResolvedValue(
        session({ lastUsedAt: new Date(Date.now() - 14 * 60_000) }),
      );
      users.findById.mockResolvedValue(user());
      sessions.rotate.mockResolvedValue(true);

      await expect(service.refresh('t', {})).resolves.toBeDefined();
    });

    it('does not idle-limit Android sessions', async () => {
      const { service, users, sessions, policies } = setup();
      sessions.findByHash.mockResolvedValue(
        session({
          platform: 'ANDROID',
          lastUsedAt: new Date(Date.now() - 5 * 86_400_000),
        }),
      );
      users.findById.mockResolvedValue(user());
      sessions.rotate.mockResolvedValue(true);

      await expect(service.refresh('t', {})).resolves.toBeDefined();
      expect(policies.forUser).not.toHaveBeenCalled();
    });
  });
});
