import type { AppConfigService } from '../../../config/app-config.service';
import type { UserAuthPolicyService } from '../policy/user-auth-policy.service';
import type { TokenService } from '../token.service';
import type { TwoFactorLoginService } from '../two-factor/two-factor-login.service';
import type { LoginCodeMailer } from './login-code-mailer';
import type { LoginOtpRepository } from './login-otp.repository';
import { OtpRequestService } from './otp-request.service';
import { ParentEmailService } from './parent-email.service';

const EMAIL = 'parent@example.com';
const OK = { ok: true, resendAfterSeconds: 60 };

interface Options {
  input?: string;
  parent?: boolean;
  lastIssuedAt?: Date | null;
  required?: boolean;
}

function setup(options: Options = {}) {
  const emails = {
    normalize: (raw: string) => ParentEmailService.prototype.normalize(raw),
    findParent: jest
      .fn()
      .mockResolvedValue(
        options.parent === false ? null : { id: 'u1', email: EMAIL },
      ),
  };
  const repository = {
    lastIssuedAt: jest.fn().mockResolvedValue(options.lastIssuedAt ?? null),
    replace: jest.fn<Promise<void>, [object]>().mockResolvedValue(undefined),
  };
  const mailer = { send: jest.fn<void, [string, string, string]>() };
  const service = new OtpRequestService(
    emails as unknown as ParentEmailService,
    repository as unknown as LoginOtpRepository,
    { hash: (v: string) => `h(${v})` } as unknown as TokenService,
    mailer as unknown as LoginCodeMailer,
    {
      twoFactorRequired: jest.fn().mockResolvedValue(!!options.required),
    } as unknown as UserAuthPolicyService,
    {
      isEnabled: jest.fn().mockResolvedValue(false),
    } as unknown as TwoFactorLoginService,
    { isProduction: true } as unknown as AppConfigService,
  );
  return { service, repository, mailer, emails };
}

describe('OtpRequestService', () => {
  it('stores a hashed code and emails it to the parent', async () => {
    const { service, repository, mailer, emails } = setup();
    await expect(service.request(' Parent@Example.COM ')).resolves.toEqual(OK);

    expect(emails.findParent).toHaveBeenCalledWith(EMAIL);
    const stored = repository.replace.mock.calls[0][0] as {
      id: string;
      email: string;
      codeHash: string;
      expiresAt: Date;
    };
    const [userId, to, code] = mailer.send.mock.calls[0];
    expect(userId).toBe('u1');
    expect(to).toBe(EMAIL);
    expect(code).toMatch(/^\d{6}$/);
    expect(stored.email).toBe(EMAIL);
    expect(stored.codeHash).toBe(`h(login-otp:${stored.id}:${code})`);
    const ttl = stored.expiresAt.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(4.9 * 60_000);
    expect(ttl).toBeLessThanOrEqual(5 * 60_000);
  });

  const silent: [string, Options][] = [
    ['an invalid email', { input: 'not-an-email' }],
    ['a non-parent', { parent: false }],
    ['a repeat within 60 s', { lastIssuedAt: new Date(Date.now() - 30_000) }],
    ['a parent who must set up 2FA first', { required: true }],
  ];

  it.each(silent)(
    'answers the same and sends nothing for %s',
    async (_, options) => {
      const { service, mailer, repository } = setup(options);
      await expect(service.request(options.input ?? EMAIL)).resolves.toEqual(
        OK,
      );
      expect(mailer.send).not.toHaveBeenCalled();
      expect(repository.replace).not.toHaveBeenCalled();
    },
  );

  it('sends again once the cooldown has passed', async () => {
    const { service, mailer } = setup({
      lastIssuedAt: new Date(Date.now() - 61_000),
    });
    await service.request(EMAIL);
    expect(mailer.send).toHaveBeenCalledTimes(1);
  });
});
