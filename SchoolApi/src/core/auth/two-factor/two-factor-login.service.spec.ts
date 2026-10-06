import type { AuditService } from '../../audit/audit.service';
import { ErrorCode } from '../../common/errors/error-code.enum';
import type { AccessCache } from '../../rbac/access/access-cache';
import { LockoutService } from '../lockout.service';
import type { SessionIssuer } from '../sessions/session-issuer';
import type { UserAccountRepository } from '../user-account.repository';
import type { TwoFactorCodes } from './two-factor-codes';
import { TwoFactorLoginService } from './two-factor-login.service';
import type { TwoFactorRepository } from './two-factor.repository';

const challenge = {
  id: 'c1',
  userId: 'u1',
  platform: 'WEB',
  deviceName: null,
  ip: null,
  userAgent: null,
};

function setup() {
  const repository = {
    findChallenge: jest.fn().mockResolvedValue(challenge),
    find: jest
      .fn()
      .mockResolvedValue({ secretEnc: 'enc', enabledAt: new Date() }),
    takeAttempt: jest.fn().mockResolvedValue(true),
    consumeChallenge: jest.fn().mockResolvedValue(true),
    remainingRecoveryCodes: jest.fn().mockResolvedValue(9),
  };
  const codes = { consume: jest.fn() };
  const users = {
    findById: jest
      .fn()
      .mockResolvedValue({ id: 'u1', status: 'ACTIVE', lockedUntil: null }),
    incrementFailures: jest.fn().mockResolvedValue(1),
    lock: jest.fn().mockResolvedValue(true),
    recordLogin: jest.fn(),
  };
  const issuer = { start: jest.fn().mockResolvedValue({ accessToken: 'jwt' }) };
  const audit = { stage: jest.fn(), recordNow: jest.fn() };
  const service = new TwoFactorLoginService(
    repository as unknown as TwoFactorRepository,
    codes as unknown as TwoFactorCodes,
    users as unknown as UserAccountRepository,
    new LockoutService(
      users as unknown as UserAccountRepository,
      audit as unknown as AuditService,
    ),
    {
      assignments: jest.fn().mockResolvedValue([{ id: 'a1' }]),
    } as unknown as AccessCache,
    issuer as unknown as SessionIssuer,
    audit as unknown as AuditService,
  );
  return { service, repository, codes, users, issuer, audit };
}

const codeOf = (promise: Promise<unknown>) =>
  promise.then(
    () => 'resolved',
    (error: { code?: string }) => error.code,
  );

describe('TwoFactorLoginService.verify', () => {
  it('issues tokens and resets the counter for a valid code', async () => {
    const { service, codes, users, issuer, repository } = setup();
    codes.consume.mockResolvedValue('totp');

    await expect(service.verify('c1', '123456', {})).resolves.toEqual({
      accessToken: 'jwt',
    });
    expect(repository.consumeChallenge).toHaveBeenCalledWith('c1');
    expect(users.recordLogin).toHaveBeenCalledWith('u1');
    expect(issuer.start).toHaveBeenCalled();
  });

  it('counts a wrong code against the account lockout', async () => {
    const { service, codes, users, issuer } = setup();
    codes.consume.mockResolvedValue(null);

    expect(await codeOf(service.verify('c1', '000000', {}))).toBe(
      ErrorCode.INVALID_CREDENTIALS,
    );
    expect(users.incrementFailures).toHaveBeenCalledWith('u1');
    expect(issuer.start).not.toHaveBeenCalled();
  });

  it('locks the account on the fifth failure', async () => {
    const { service, codes, users } = setup();
    codes.consume.mockResolvedValue(null);
    users.incrementFailures.mockResolvedValue(5);

    expect(await codeOf(service.verify('c1', '000000', {}))).toBe(
      ErrorCode.ACCOUNT_LOCKED,
    );
  });

  it('refuses a challenge without attempts left before checking the code', async () => {
    const { service, codes, repository } = setup();
    repository.takeAttempt.mockResolvedValue(false);

    expect(await codeOf(service.verify('c1', '123456', {}))).toBe(
      ErrorCode.INVALID_CREDENTIALS,
    );
    expect(codes.consume).not.toHaveBeenCalled();
  });

  it('refuses unknown challenges and locked accounts', async () => {
    const { service, repository, users } = setup();
    repository.findChallenge.mockResolvedValueOnce(null);
    expect(await codeOf(service.verify('cx', '123456', {}))).toBe(
      ErrorCode.INVALID_CREDENTIALS,
    );
    users.findById.mockResolvedValueOnce({
      id: 'u1',
      status: 'ACTIVE',
      lockedUntil: new Date(Date.now() + 60_000),
    });
    expect(await codeOf(service.verify('c1', '123456', {}))).toBe(
      ErrorCode.ACCOUNT_LOCKED,
    );
  });

  it('audits recovery code use', async () => {
    const { service, codes, audit } = setup();
    codes.consume.mockResolvedValue('recovery');

    await service.verify('c1', 'abcde-fghij', {});
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.2fa_recovery_used' }),
    );
  });
});
