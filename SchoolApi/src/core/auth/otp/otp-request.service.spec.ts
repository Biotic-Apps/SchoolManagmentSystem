import type { AppConfigService } from '../../../config/app-config.service';
import type { NotificationService } from '../../notifications/notification.service';
import type { UserAuthPolicyService } from '../policy/user-auth-policy.service';
import type { TokenService } from '../token.service';
import type { TwoFactorLoginService } from '../two-factor/two-factor-login.service';
import type { LoginOtpRepository } from './login-otp.repository';
import { OtpRequestService } from './otp-request.service';
import type { ParentPhoneService } from './parent-phone.service';

const PHONE = '+923001112233';
const OK = { ok: true, resendAfterSeconds: 60 };

interface Options {
  input?: string;
  parent?: boolean;
  lastIssuedAt?: Date | null;
  required?: boolean;
}

function setup(options: Options = {}) {
  const phones = {
    normalize: jest.fn((raw: string) => (raw === 'bad' ? null : PHONE)),
    findParent: jest
      .fn()
      .mockResolvedValue(options.parent === false ? null : { id: 'u1' }),
  };
  const repository = {
    lastIssuedAt: jest.fn().mockResolvedValue(options.lastIssuedAt ?? null),
    replace: jest.fn<Promise<void>, [object]>().mockResolvedValue(undefined),
  };
  const notifications = {
    sendDirect: jest.fn<Promise<void>, [object]>().mockResolvedValue(undefined),
  };
  const service = new OtpRequestService(
    phones as unknown as ParentPhoneService,
    repository as unknown as LoginOtpRepository,
    { hash: (v: string) => `h(${v})` } as unknown as TokenService,
    notifications as unknown as NotificationService,
    {
      twoFactorRequired: jest.fn().mockResolvedValue(!!options.required),
    } as unknown as UserAuthPolicyService,
    {
      isEnabled: jest.fn().mockResolvedValue(false),
    } as unknown as TwoFactorLoginService,
    { isProduction: true } as unknown as AppConfigService,
  );
  return { service, repository, notifications };
}

describe('OtpRequestService', () => {
  it('stores a hashed code and sends it by SMS to the E.164 number', async () => {
    const { service, repository, notifications } = setup();
    await expect(service.request('0300-1112233')).resolves.toEqual(OK);

    const stored = repository.replace.mock.calls[0][0] as {
      id: string;
      codeHash: string;
      expiresAt: Date;
    };
    const sms = notifications.sendDirect.mock.calls[0][0] as {
      body: string;
      to: { phone: string };
    };
    const code = /(\d{6})/.exec(sms.body)![1];
    expect(sms.to.phone).toBe(PHONE);
    expect(stored.codeHash).toBe(`h(login-otp:${stored.id}:${code})`);
    const ttl = stored.expiresAt.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(4.9 * 60_000);
    expect(ttl).toBeLessThanOrEqual(5 * 60_000);
  });

  const silent: [string, Options][] = [
    ['an invalid number', { input: 'bad' }],
    ['a non-parent', { parent: false }],
    ['a repeat within 60 s', { lastIssuedAt: new Date(Date.now() - 30_000) }],
    ['a parent who must set up 2FA first', { required: true }],
  ];

  it.each(silent)(
    'answers the same and sends nothing for %s',
    async (_, options) => {
      const { service, notifications, repository } = setup(options);
      await expect(
        service.request(options.input ?? '03001112233'),
      ).resolves.toEqual(OK);
      expect(notifications.sendDirect).not.toHaveBeenCalled();
      expect(repository.replace).not.toHaveBeenCalled();
    },
  );

  it('sends again once the cooldown has passed', async () => {
    const { service, notifications } = setup({
      lastIssuedAt: new Date(Date.now() - 61_000),
    });
    await service.request('03001112233');
    expect(notifications.sendDirect).toHaveBeenCalledTimes(1);
  });
});
