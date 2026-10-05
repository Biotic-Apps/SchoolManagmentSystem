import type { User } from '../../generated/prisma/client';
import type { AppConfigService } from '../../config/app-config.service';
import type { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../common/errors/error-code.enum';
import type { AccessCache } from '../rbac/access/access-cache';
import type { AuthStateCache } from './auth-state.cache';
import { AuthService } from './auth.service';
import type { PasswordHasher } from './password/password-hasher';
import type { RefreshSessionRepository } from './sessions/refresh-session.repository';
import type { SessionsService } from './sessions/sessions.service';
import type { TokenService } from './token.service';
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
  expiresAt: new Date(Date.now() + 60_000),
  ...overrides,
});

function setup() {
  const users = {
    findByIdentifier: jest.fn(),
    findById: jest.fn(),
    recordFailure: jest.fn(),
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
  const service = new AuthService(
    users as unknown as UserAccountRepository,
    sessions as unknown as RefreshSessionRepository,
    sessionsService as unknown as SessionsService,
    tokens as unknown as TokenService,
    hasher as unknown as PasswordHasher,
    { invalidateUser: jest.fn() } as unknown as AuthStateCache,
    access as unknown as AccessCache,
    { stage: jest.fn() } as unknown as AuditService,
    { get: () => 30 } as unknown as AppConfigService,
  );
  return { service, users, sessions, sessionsService, hasher, tokens };
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
      const { service, sessions, sessionsService } = setup();
      sessions.findByHash.mockResolvedValue(
        session({ revokedAt: new Date(), replacedById: 's2' }),
      );

      expect(await codeOf(service.refresh('old-token', {}))).toBe(
        ErrorCode.SESSION_REVOKED,
      );
      expect(sessionsService.revokeFamily).toHaveBeenCalledWith('fam1');
      expect(sessions.rotate).not.toHaveBeenCalled();
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
      hasher.verify.mockResolvedValue(false);

      expect(
        await codeOf(service.login('a@b.c', 'bad', { platform: 'WEB' })),
      ).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(users.recordFailure).toHaveBeenCalledWith('u1', 3, null);
    });

    it('locks the account on the fifth failure', async () => {
      const { service, users, hasher } = setup();
      users.findByIdentifier.mockResolvedValue(user({ failedLoginCount: 4 }));
      hasher.verify.mockResolvedValue(false);

      expect(
        await codeOf(service.login('a@b.c', 'bad', { platform: 'WEB' })),
      ).toBe(ErrorCode.ACCOUNT_LOCKED);
      const [, count, until] = users.recordFailure.mock.calls[0] as [
        string,
        number,
        Date,
      ];
      expect(count).toBe(0);
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
      expect(tokens.mustChangePassword).toBe(false);
    });
  });
});
