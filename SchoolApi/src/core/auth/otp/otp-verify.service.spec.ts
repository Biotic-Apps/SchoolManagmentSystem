import type { AuditService } from '../../audit/audit.service';
import { ErrorCode } from '../../common/errors/error-code.enum';
import type { LockoutService } from '../lockout.service';
import type { SessionIssuer } from '../sessions/session-issuer';
import type { TokenService } from '../token.service';
import type { TwoFactorLoginService } from '../two-factor/two-factor-login.service';
import type { UserAccountRepository } from '../user-account.repository';
import type { LoginOtpRepository } from './login-otp.repository';
import { otpHashInput } from './otp-code';
import { OtpVerifyService } from './otp-verify.service';
import type { ParentEmailService } from './parent-email.service';

const hash = (v: string) => `h(${v})`;
const OTP = {
  id: 'otp1',
  userId: 'u1',
  codeHash: hash(otpHashInput('otp1', '123456')),
};
const CLIENT = { platform: 'ANDROID' as const };

interface Options {
  email?: string;
  otp?: typeof OTP | null;
  attempt?: boolean;
  twoFactor?: boolean;
  parent?: boolean;
}

function setup(options: Options = {}) {
  const repository = {
    findUsable: jest
      .fn()
      .mockResolvedValue(options.otp === undefined ? OTP : options.otp),
    takeAttempt: jest.fn().mockResolvedValue(options.attempt ?? true),
    consume: jest.fn().mockResolvedValue(true),
  };
  const lockout = {
    assertNotLocked: jest.fn(),
    registerFailure: jest.fn().mockRejectedValue(new Error('wrong code')),
  };
  const issuer = { start: jest.fn().mockResolvedValue({ accessToken: 'a' }) };
  const twoFactor = {
    isEnabled: jest.fn().mockResolvedValue(!!options.twoFactor),
    challenge: jest.fn().mockResolvedValue({ twoFactorRequired: true }),
  };
  const audit = { stage: jest.fn() };
  const users = {
    findById: jest.fn().mockResolvedValue({ id: 'u1', status: 'ACTIVE' }),
    recordLogin: jest.fn(),
  };
  const service = new OtpVerifyService(
    {
      normalize: (raw: string) => (raw === 'bad' ? null : 'parent@example.com'),
      isParent: jest.fn().mockResolvedValue(options.parent ?? true),
    } as unknown as ParentEmailService,
    repository as unknown as LoginOtpRepository,
    { hash } as unknown as TokenService,
    users as unknown as UserAccountRepository,
    lockout as unknown as LockoutService,
    twoFactor as unknown as TwoFactorLoginService,
    issuer as unknown as SessionIssuer,
    audit as unknown as AuditService,
  );
  return { service, repository, lockout, issuer, twoFactor, audit, users };
}

describe('OtpVerifyService', () => {
  it('issues tokens for the right code and audits method otp', async () => {
    const { service, issuer, audit, users, repository } = setup();
    await expect(
      service.verify('parent@example.com', ' 123456 ', CLIENT),
    ).resolves.toEqual({
      accessToken: 'a',
    });
    expect(repository.consume).toHaveBeenCalledWith('otp1');
    expect(users.recordLogin).toHaveBeenCalledWith('u1');
    expect(issuer.start).toHaveBeenCalled();
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth.login',
        after: expect.objectContaining({ method: 'otp' }) as unknown,
      }),
    );
  });

  it('returns a 2FA challenge when the parent has 2FA on', async () => {
    const { service, issuer, twoFactor } = setup({ twoFactor: true });
    await expect(
      service.verify('parent@example.com', '123456', CLIENT),
    ).resolves.toEqual({
      twoFactorRequired: true,
    });
    expect(twoFactor.challenge).toHaveBeenCalled();
    expect(issuer.start).not.toHaveBeenCalled();
  });

  it('counts a wrong code toward the account lockout', async () => {
    const { service, lockout, repository } = setup();
    await expect(
      service.verify('parent@example.com', '654321', CLIENT),
    ).rejects.toThrow('wrong code');
    expect(lockout.registerFailure).toHaveBeenCalledWith(
      'u1',
      'Invalid or expired code',
    );
    expect(repository.consume).not.toHaveBeenCalled();
  });

  const rejected: [string, Options][] = [
    ['an invalid email', { email: 'bad' }],
    ['no usable code', { otp: null }],
    ['no attempts left', { attempt: false }],
    ['a user who is no longer a parent', { parent: false }],
  ];

  it.each(rejected)('rejects %s with INVALID_CREDENTIALS', async (_, opts) => {
    const { service, lockout } = setup(opts);
    await expect(
      service.verify(opts.email ?? 'parent@example.com', '123456', CLIENT),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });
    expect(lockout.registerFailure).not.toHaveBeenCalled();
  });

  it('checks the lockout before spending an attempt', async () => {
    const { service, lockout, repository } = setup();
    lockout.assertNotLocked.mockImplementation(() => {
      throw new Error('locked');
    });
    await expect(
      service.verify('parent@example.com', '123456', CLIENT),
    ).rejects.toThrow('locked');
    expect(repository.takeAttempt).not.toHaveBeenCalled();
  });
});
