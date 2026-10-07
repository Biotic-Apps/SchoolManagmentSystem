import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { UserAuthPolicyService } from '../src/core/auth/policy/user-auth-policy.service';
import { SmsChannel } from '../src/core/notifications/channels/sms.channel';
import type { ChannelMessage } from '../src/core/notifications/channels/channel-message';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { SchoolSettingsReader } from '../src/core/school-settings/school-settings.reader';
import { API, as, createTestApp, errorCode, login } from './support/test-app';

jest.setTimeout(120_000);

type Json = Record<string, any>;
const data = (res: { body: unknown }) => (res.body as { data: Json }).data;

/** Unique Pakistani mobile per test run: `+92345xxxxxxx`. */
let serial = Date.now() % 1_000_000;
const nextPhone = () => `+92345${String(++serial).padStart(7, '0')}`;

describe('Parent phone + OTP sign-in (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let schoolId: string;
  let sent: ChannelMessage[];

  const server = () => app.getHttpServer();
  const requestCode = (phone: string) =>
    request(server()).post(`${API}/auth/otp/request`).send({ phone });
  const verify = (phone: string, code: string, platform = 'ANDROID') =>
    request(server())
      .post(`${API}/auth/otp/verify`)
      .send({ phone, code, platform, deviceName: 'e2e phone' });

  /** Inline jobs run after the response: wait for the SMS to the phone. */
  async function codeSentTo(phone: string, count = 1): Promise<string> {
    for (let i = 0; i < 100; i++) {
      const mine = sent.filter((m) => m.phone === phone);
      if (mine.length >= count) {
        return /(\d{6})/.exec(mine[count - 1].body)![1];
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error(`No SMS #${count} to ${phone}`);
  }
  const settle = () => new Promise((r) => setTimeout(r, 300));
  const smsCount = (phone: string) =>
    sent.filter((m) => m.phone === phone).length;

  async function newUser(roleKey: 'PARENT' | 'TEACHER', phone: string) {
    const role = await prisma.role.findFirstOrThrow({
      where: { key: roleKey, schoolId: null },
    });
    const user = await prisma.user.create({
      data: {
        name: `OTP ${roleKey}`,
        phone,
        passwordHash: 'unused',
      },
    });
    await prisma.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: role.id,
        scopeType: roleKey === 'PARENT' ? 'GUARDIAN' : 'SCHOOL',
        schoolId,
      },
    });
    return user;
  }

  /** Lets the next request through the 60 s cooldown. */
  const ageCodes = (phone: string) =>
    prisma.loginOtp.updateMany({
      where: { phone },
      data: { createdAt: new Date(Date.now() - 61_000) },
    });
  const resetFailures = (userId: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockedUntil: null },
    });

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    schoolId = (await prisma.school.findFirstOrThrow()).id;
    const sms = app.get(SmsChannel);
    const original = sms.send.bind(sms);
    jest.spyOn(sms, 'send').mockImplementation((message) => {
      sent.push(message);
      return original(message);
    });
  });

  beforeEach(() => {
    sent = [];
  });

  afterAll(async () => {
    await app.close();
  });

  it('signs a parent in with any phone format and audits method otp', async () => {
    const phone = nextPhone();
    const parent = await newUser('PARENT', phone);
    const local = `0${phone.slice(3, 6)}-${phone.slice(6)}`;

    const res = await requestCode(local).expect(200);
    expect(data(res)).toEqual({ ok: true, resendAfterSeconds: 60 });
    const code = await codeSentTo(phone);
    const row = await prisma.loginOtp.findFirstOrThrow({ where: { phone } });
    expect(row.codeHash).not.toContain(code);
    expect(row.userId).toBe(parent.id);

    const tokens = data(await verify(local, code).expect(200));
    expect(tokens).toMatchObject({
      accessToken: expect.any(String) as unknown,
      refreshToken: expect.any(String) as unknown,
      mustChangePassword: false,
    });
    await as(app, tokens.accessToken as string)
      .get('/me')
      .expect(200);
    const audit = await prisma.auditLog.findFirst({
      where: { action: 'auth.login', entityId: parent.id },
      orderBy: { at: 'desc' },
    });
    expect((audit?.after as Json).method).toBe('otp');
    expect((audit?.after as Json).platform).toBe('ANDROID');

    // Single use.
    expect(errorCode(await verify(phone, code).expect(401))).toBe(
      'INVALID_CREDENTIALS',
    );
  });

  it('answers the same for unknown, invalid and non-parent phones (no SMS)', async () => {
    const teacherPhone = nextPhone();
    await newUser('TEACHER', teacherPhone);
    for (const phone of [nextPhone(), teacherPhone, 'not-a-phone']) {
      const res = await requestCode(phone).expect(200);
      expect(data(res)).toEqual({ ok: true, resendAfterSeconds: 60 });
    }
    await settle();
    expect(sent).toHaveLength(0);
    expect(
      await prisma.loginOtp.count({ where: { phone: teacherPhone } }),
    ).toBe(0);
    const res = await verify(teacherPhone, '123456').expect(401);
    expect(res.body).toMatchObject({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid or expired code',
      },
    });
  });

  it('ignores a repeat within 60 s and invalidates older codes after it', async () => {
    const phone = nextPhone();
    await newUser('PARENT', phone);
    await requestCode(phone).expect(200);
    const first = await codeSentTo(phone);
    await requestCode(phone).expect(200);
    await settle();
    expect(smsCount(phone)).toBe(1);

    await ageCodes(phone);
    await requestCode(phone).expect(200);
    const second = await codeSentTo(phone, 2);
    if (first !== second) await verify(phone, first).expect(401);
    await verify(phone, second).expect(200);
  });

  it('allows 5 attempts per code', async () => {
    const phone = nextPhone();
    const parent = await newUser('PARENT', phone);
    await requestCode(phone).expect(200);
    const code = await codeSentTo(phone);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      // Keep the account lockout out of the way: this checks the per-code limit.
      await resetFailures(parent.id);
      await verify(phone, wrong).expect(401);
    }
    await resetFailures(parent.id);
    await verify(phone, code).expect(401);
  });

  it('counts wrong codes toward the shared account lockout', async () => {
    const phone = nextPhone();
    const parent = await newUser('PARENT', phone);
    await requestCode(phone).expect(200);
    const code = await codeSentTo(phone);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i++) await verify(phone, wrong).expect(401);
    const locked = await verify(phone, wrong).expect(423);
    expect(errorCode(locked)).toBe('ACCOUNT_LOCKED');

    await ageCodes(phone);
    await requestCode(phone).expect(200);
    const next = await codeSentTo(phone, 2);
    expect(errorCode(await verify(phone, next).expect(423))).toBe(
      'ACCOUNT_LOCKED',
    );
    await resetFailures(parent.id);
    await verify(phone, next).expect(200);
  });

  it('rejects expired codes', async () => {
    const phone = nextPhone();
    await newUser('PARENT', phone);
    await requestCode(phone).expect(200);
    const code = await codeSentTo(phone);
    await prisma.loginOtp.updateMany({
      where: { phone },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await verify(phone, code).expect(401);
  });

  it('hands out a 2FA challenge when the parent has 2FA on', async () => {
    const phone = nextPhone();
    const parent = await newUser('PARENT', phone);
    await prisma.userTwoFactor.create({
      data: { userId: parent.id, secretEnc: 'unused', enabledAt: new Date() },
    });
    await requestCode(phone).expect(200);
    const code = await codeSentTo(phone);
    const res = data(await verify(phone, code, 'WEB').expect(200));
    expect(res).toEqual({
      twoFactorRequired: true,
      challengeId: expect.any(String) as unknown,
    });
  });

  it('sends no code when 2FA is required for parents but not set up', async () => {
    const phone = nextPhone();
    const parent = await newUser('PARENT', phone);
    const reader = app.get(SchoolSettingsReader);
    const before = await prisma.schoolSetting.findUnique({
      where: { schoolId },
    });
    await prisma.schoolSetting.upsert({
      where: { schoolId },
      create: { schoolId, policies: { twoFactorRequiredFor: ['PARENT'] } },
      update: { policies: { twoFactorRequiredFor: ['PARENT'] } },
    });
    await reader.invalidate(schoolId);
    try {
      await requestCode(phone).expect(200);
      await settle();
      expect(smsCount(phone)).toBe(0);
    } finally {
      await prisma.schoolSetting.update({
        where: { schoolId },
        data: { policies: before?.policies ?? {} },
      });
      await reader.invalidate(schoolId);
      await app.get(UserAuthPolicyService).invalidateUser(parent.id);
    }
  });

  it('seeds the demo parent with a phone that can sign in', async () => {
    const parent = await prisma.user.findUniqueOrThrow({
      where: { email: 'parent@eschool.local' },
    });
    expect(parent.phone).toBe('+923001112233');
    // Password login keeps working for the same account.
    await login(app, 'parent@eschool.local');
  });
});
