import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import {
  base32Decode,
  hotp,
  totpStep,
  TOTP_STEP_SECONDS,
} from '../src/core/auth/two-factor/totp';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { SchoolSettingsReader } from '../src/core/school-settings/school-settings.reader';
import {
  API,
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

jest.setTimeout(180_000);

const START = 'Start1234x';
const PASSWORD = 'Changed1234x';

/** Next TOTP the server accepts: newer than the last used step, within ±1. */
class TotpClock {
  private last = 0;
  async next(secret: string): Promise<string> {
    const step = Math.max(this.last + 1, totpStep() - 1);
    const waitMs = (step - 1) * TOTP_STEP_SECONDS * 1000 - Date.now() + 200;
    if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
    this.last = step;
    return hotp(base32Decode(secret), step);
  }
  lastCode(secret: string): string {
    return hotp(base32Decode(secret), this.last);
  }
}

type Json = Record<string, any>;
const data = (res: { body: unknown }) => (res.body as { data: Json }).data;

interface LoginBody {
  accessToken?: string;
  refreshToken?: string;
  twoFactorRequired?: boolean;
  challengeId?: string;
}

describe('Two-factor sign-in, unlock and policies (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let admin: string;
  let branchId: string;
  let schoolId: string;

  const server = () => app.getHttpServer();
  const postLogin = (
    identifier: string,
    password = PASSWORD,
    platform = 'WEB',
  ) =>
    request(server())
      .post(`${API}/auth/login`)
      .send({ identifier, password, platform });
  const loginBody = async (identifier: string, password = PASSWORD) =>
    data(await postLogin(identifier, password).expect(200)) as LoginBody;
  const verify = (challengeId: string, code: string) =>
    request(server())
      .post(`${API}/auth/2fa/verify`)
      .send({ challengeId, code });

  async function setPolicies(policies: object) {
    await prisma.schoolSetting.upsert({
      where: { schoolId },
      create: { schoolId, policies },
      update: { policies },
    });
    await app.get(SchoolSettingsReader).invalidate(schoolId);
  }

  /** New staff member whose first password change is done; returns a token. */
  async function newUser(roleKey = 'TEACHER') {
    const email = `${unique(roleKey).toLowerCase()}${Math.random().toString(36).slice(2, 6)}@eschool.local`;
    const res = await as(app, admin)
      .post('/users', {
        name: 'E2E 2FA',
        email,
        password: START,
        assignments: [{ roleKey, scopeType: 'BRANCH', branchId }],
      })
      .expect(201);
    const first = await login(app, email, START);
    await as(app, first.accessToken)
      .post('/auth/password/change', {
        currentPassword: START,
        newPassword: PASSWORD,
      })
      .expect(200);
    return {
      id: (res.body as { data: { id: string } }).data.id,
      email,
      token: first.accessToken,
    };
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = (await login(app, 'admin@eschool.local')).accessToken;
    const branches = await as(app, admin).get('/branches').expect(200);
    const branch = (
      branches.body as { data: { id: string; schoolId: string }[] }
    ).data[0];
    branchId = branch.id;
    schoolId = branch.schoolId;
  });

  afterAll(async () => {
    await setPolicies({});
    await app.close();
  });

  it('runs the full TOTP lifecycle with recovery codes', async () => {
    const clock = new TotpClock();
    const user = await newUser();

    await as(app, user.token).post('/auth/2fa/setup').expect(200);
    const setup = await as(app, user.token).post('/auth/2fa/setup').expect(200);
    const { secret, otpauthUrl } = data(setup) as {
      secret: string;
      otpauthUrl: string;
    };
    expect(otpauthUrl).toMatch(
      /^otpauth:\/\/totp\/eSchool%3A.+secret=[A-Z2-7]{32}/,
    );

    const enable = await as(app, user.token)
      .post('/auth/2fa/enable', { code: await clock.next(secret) })
      .expect(200);
    const { recoveryCodes } = data(enable) as { recoveryCodes: string[] };
    expect(recoveryCodes).toHaveLength(10);
    expect(
      errorCode(await as(app, user.token).post('/auth/2fa/setup').expect(409)),
    ).toBe('CONFLICT');
    const me = await as(app, user.token).get('/me').expect(200);
    expect(data(me).twoFactor).toEqual({ enabled: true, required: false });

    const first = await loginBody(user.email);
    expect(first).toEqual({
      twoFactorRequired: true,
      challengeId: expect.any(String) as unknown,
    });
    expect(
      errorCode(await verify(first.challengeId!, '000000').expect(401)),
    ).toBe('INVALID_CREDENTIALS');
    const tokens = data(
      await verify(first.challengeId!, await clock.next(secret)).expect(200),
    ) as LoginBody;
    await as(app, tokens.accessToken!).get('/me').expect(200);
    await verify(first.challengeId!, '123456').expect(401); // consumed

    const second = await loginBody(user.email);
    await verify(second.challengeId!, clock.lastCode(secret)).expect(401); // replayed step
    const viaRecovery = await verify(
      second.challengeId!,
      recoveryCodes[0].toUpperCase(),
    ).expect(200);
    expect((data(viaRecovery) as LoginBody).refreshToken).toBeDefined();

    const third = await loginBody(user.email);
    await verify(third.challengeId!, recoveryCodes[0]).expect(401);

    const disable = (password: string, code: string) =>
      as(app, user.token).post('/auth/2fa/disable', { password, code });
    expect(
      errorCode(await disable('Wrong1234x', recoveryCodes[1]).expect(401)),
    ).toBe('INVALID_CREDENTIALS');
    await disable(PASSWORD, await clock.next(secret)).expect(200);

    const direct = await loginBody(user.email);
    expect(direct.accessToken).toBeDefined();
    expect(direct.twoFactorRequired).toBeUndefined();
  });

  it('enforces twoFactorRequiredFor for roles that have not set it up', async () => {
    const clock = new TotpClock();
    await setPolicies({ twoFactorRequiredFor: ['ACCOUNTANT'] });
    try {
      const user = await newUser('ACCOUNTANT');
      const { accessToken } = await login(app, user.email, PASSWORD);
      const blocked = await as(app, accessToken).get('/students').expect(403);
      expect(errorCode(blocked)).toBe('TWO_FACTOR_SETUP_REQUIRED');
      const me = await as(app, accessToken).get('/me').expect(200);
      expect(data(me).twoFactor).toEqual({
        enabled: false,
        required: true,
      });
      expect((data(me).user as Json).twoFactorRequired).toBe(true);

      const setup = await as(app, accessToken)
        .post('/auth/2fa/setup')
        .expect(200);
      const { secret } = data(setup) as { secret: string };
      await as(app, accessToken)
        .post('/auth/2fa/enable', { code: await clock.next(secret) })
        .expect(200);
      const after = await as(app, accessToken).get('/students');
      expect(after.status).not.toBe(403);

      const refused = await as(app, accessToken)
        .post('/auth/2fa/disable', {
          password: PASSWORD,
          code: await clock.next(secret),
        })
        .expect(403);
      expect(errorCode(refused)).toBe('FORBIDDEN');
    } finally {
      await setPolicies({});
    }
  });

  it('lets an admin unlock a locked account', async () => {
    const user = await newUser();
    for (let i = 0; i < 4; i++)
      await postLogin(user.email, 'nope12345x').expect(401);
    expect(
      errorCode(await postLogin(user.email, 'nope12345x').expect(423)),
    ).toBe('ACCOUNT_LOCKED');
    await postLogin(user.email).expect(423);

    const adminMe = data(await as(app, admin).get('/me').expect(200));
    const adminId = (adminMe.user as { id: string }).id;
    await as(app, admin).post(`/users/${adminId}/unlock`).expect(403);
    const unlocked = await as(app, admin)
      .post(`/users/${user.id}/unlock`)
      .expect(200);
    expect(data(unlocked).lockedUntil).toBeNull();
    await postLogin(user.email).expect(200);
  });

  it('times out idle web sessions on refresh but not Android ones', async () => {
    const user = await newUser();
    const web = data(await postLogin(user.email).expect(200)) as LoginBody;
    const android = data(
      await postLogin(user.email, PASSWORD, 'ANDROID').expect(200),
    ) as LoginBody;
    await prisma.refreshSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { lastUsedAt: new Date(Date.now() - 3 * 3_600_000) },
    });

    const refresh = (token: string) =>
      request(server())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken: token });
    const timedOut = await refresh(web.refreshToken!).expect(401);
    expect(errorCode(timedOut)).toBe('SESSION_REVOKED');
    const error = (timedOut.body as { error: { message: string } }).error;
    expect(error.message).toBe('Session timed out');
    await as(app, web.accessToken!).get('/me').expect(401);
    await refresh(android.refreshToken!).expect(200);
  });

  it('applies the school password policy to changes and new accounts', async () => {
    const user = await newUser();
    await setPolicies({
      passwordPolicy: { minLength: 12, requireDigit: true },
    });
    try {
      const change = (newPassword: string) =>
        as(app, user.token).post('/auth/password/change', {
          currentPassword: PASSWORD,
          newPassword,
        });
      expect(errorCode(await change('Short1234x').expect(400))).toBe(
        'VALIDATION_FAILED',
      );
      await change('LongerPass1234').expect(200);

      const created = await as(app, admin).post('/users', {
        name: 'Policy',
        email: `${unique('policy').toLowerCase()}@eschool.local`,
        password: START,
        assignments: [{ roleKey: 'TEACHER', scopeType: 'BRANCH', branchId }],
      });
      expect(created.status).toBe(400);
    } finally {
      await setPolicies({});
    }
  });
});
