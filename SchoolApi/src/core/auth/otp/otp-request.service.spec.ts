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
  config?: { production: boolean; driver: string; echo: boolean };
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
    configOf(options.config),
  );
  return { service, repository, mailer, emails };
}

function configOf(
  c = { production: true, driver: 'smtp', echo: false },
): AppConfigService {
  const env: Record<string, unknown> = {
    EMAIL_DRIVER: c.driver,
    OTP_DEV_ECHO: c.echo,
  };
  return {
    isProduction: c.production,
    get: (key: string) => env[key],
  } as unknown as AppConfigService;
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

  it('never returns the code in production, even with OTP_DEV_ECHO and the log driver', async () => {
    const { service } = setup({
      config: { production: true, driver: 'log', echo: true },
    });
    const result = await service.request(EMAIL);
    expect(result).toEqual(OK);
    expect(result).not.toHaveProperty('devCode');
  });

  it('does not echo with real email (smtp) or without the flag', async () => {
    for (const config of [
      { production: false, driver: 'smtp', echo: true },
      { production: false, driver: 'log', echo: false },
    ]) {
      const result = await setup({ config }).service.request(EMAIL);
      expect(result).not.toHaveProperty('devCode');
    }
  });

  it('echoes the emailed code in local development when asked to', async () => {
    const { service, mailer } = setup({
      config: { production: false, driver: 'log', echo: true },
    });
    const result = await service.request(EMAIL);
    expect(result.devCode).toBe(mailer.send.mock.calls[0][2]);
  });
});
