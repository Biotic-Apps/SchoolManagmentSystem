import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { UserAuthPolicyService } from '../src/core/auth/policy/user-auth-policy.service';
import { EmailChannel } from '../src/core/notifications/channels/email.channel';
import type { ChannelMessage } from '../src/core/notifications/channels/channel-message';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { SchoolSettingsReader } from '../src/core/school-settings/school-settings.reader';
import { API, as, createTestApp, errorCode, login } from './support/test-app';

jest.setTimeout(120_000);

type Json = Record<string, any>;
const data = (res: { body: unknown }) => (res.body as { data: Json }).data;

/** Unique address per test run. */
let serial = Date.now() % 1_000_000;
const nextEmail = () => `otp-${++serial}@e2e.example.com`;

describe('Parent email + one-time code sign-in (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let schoolId: string;
  let sent: ChannelMessage[];

  const server = () => app.getHttpServer();
  const requestCode = (email: string) =>
    request(server()).post(`${API}/auth/otp/request`).send({ email });
  const verify = (email: string, code: string, platform = 'ANDROID') =>
    request(server())
      .post(`${API}/auth/otp/verify`)
      .send({ email, code, platform, deviceName: 'e2e phone' });

  /** The email is sent after the response: wait for it. */
  async function codeSentTo(email: string, count = 1): Promise<string> {
    for (let i = 0; i < 100; i++) {
      const mine = sent.filter((m) => m.email === email);
      if (mine.length >= count) {
        return /(\d{6})/.exec(mine[count - 1].body)![1];
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error(`No email #${count} to ${email}`);
  }
  const settle = () => new Promise((r) => setTimeout(r, 300));
  const emailCount = (email: string) =>
    sent.filter((m) => m.email === email).length;

  async function newUser(roleKey: 'PARENT' | 'TEACHER', email: string) {
    const role = await prisma.role.findFirstOrThrow({
      where: { key: roleKey, schoolId: null },
    });
    const user = await prisma.user.create({
      data: { name: `OTP ${roleKey}`, email, passwordHash: 'unused' },
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
  const ageCodes = (email: string) =>
    prisma.loginOtp.updateMany({
      where: { email },
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
    const channel = app.get(EmailChannel);
    const original = channel.send.bind(channel);
    jest.spyOn(channel, 'send').mockImplementation((message) => {
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

  it('signs a parent in with any letter case and audits method otp', async () => {
    const email = nextEmail();
    const parent = await newUser('PARENT', email);
    const typed = `  ${email.toUpperCase()} `;

    const res = await requestCode(typed).expect(200);
    expect(data(res)).toEqual({ ok: true, resendAfterSeconds: 60 });
    const code = await codeSentTo(email);
    const mail = sent.find((m) => m.email === email)!;
    expect(mail.title).toBe('Your eSchool sign-in code');
    expect(mail.body).toContain('5 minutes');
    const row = await prisma.loginOtp.findFirstOrThrow({ where: { email } });
    expect(row.codeHash).not.toContain(code);
    expect(row.userId).toBe(parent.id);

    const tokens = data(await verify(typed, code).expect(200));
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
    expect(errorCode(await verify(email, code).expect(401))).toBe(
      'INVALID_CREDENTIALS',
    );
  });

  it('answers the same for unknown, invalid and non-parent emails (no email)', async () => {
    const teacherEmail = nextEmail();
    await newUser('TEACHER', teacherEmail);
    for (const email of [nextEmail(), teacherEmail, 'not-an-email']) {
      const res = await requestCode(email).expect(200);
      expect(data(res)).toEqual({ ok: true, resendAfterSeconds: 60 });
    }
    await settle();
    expect(sent).toHaveLength(0);
    expect(
      await prisma.loginOtp.count({ where: { email: teacherEmail } }),
    ).toBe(0);
    const res = await verify(teacherEmail, '123456').expect(401);
    expect(res.body).toMatchObject({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid or expired code',
      },
    });
  });

  it('ignores a repeat within 60 s and invalidates older codes after it', async () => {
    const email = nextEmail();
    await newUser('PARENT', email);
    await requestCode(email).expect(200);
    const first = await codeSentTo(email);
    await requestCode(email).expect(200);
    await settle();
    expect(emailCount(email)).toBe(1);

    await ageCodes(email);
    await requestCode(email).expect(200);
    const second = await codeSentTo(email, 2);
    if (first !== second) await verify(email, first).expect(401);
    await verify(email, second).expect(200);
  });

  it('allows 5 attempts per code', async () => {
    const email = nextEmail();
    const parent = await newUser('PARENT', email);
    await requestCode(email).expect(200);
    const code = await codeSentTo(email);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      // Keep the account lockout out of the way: this checks the per-code limit.
      await resetFailures(parent.id);
      await verify(email, wrong).expect(401);
    }
    await resetFailures(parent.id);
    await verify(email, code).expect(401);
  });

  it('counts wrong codes toward the shared account lockout', async () => {
    const email = nextEmail();
    const parent = await newUser('PARENT', email);
    await requestCode(email).expect(200);
    const code = await codeSentTo(email);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i++) await verify(email, wrong).expect(401);
    const locked = await verify(email, wrong).expect(423);
    expect(errorCode(locked)).toBe('ACCOUNT_LOCKED');

    await ageCodes(email);
    await requestCode(email).expect(200);
    const next = await codeSentTo(email, 2);
    expect(errorCode(await verify(email, next).expect(423))).toBe(
      'ACCOUNT_LOCKED',
    );
    await resetFailures(parent.id);
    await verify(email, next).expect(200);
  });

  it('rejects expired codes', async () => {
    const email = nextEmail();
    await newUser('PARENT', email);
    await requestCode(email).expect(200);
    const code = await codeSentTo(email);
    await prisma.loginOtp.updateMany({
      where: { email },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await verify(email, code).expect(401);
  });

  it('hands out a 2FA challenge when the parent has 2FA on', async () => {
    const email = nextEmail();
    const parent = await newUser('PARENT', email);
    await prisma.userTwoFactor.create({
      data: { userId: parent.id, secretEnc: 'unused', enabledAt: new Date() },
    });
    await requestCode(email).expect(200);
    const code = await codeSentTo(email);
    const res = data(await verify(email, code, 'WEB').expect(200));
    expect(res).toEqual({
      twoFactorRequired: true,
      challengeId: expect.any(String) as unknown,
    });
  });

  it('sends no code when 2FA is required for parents but not set up', async () => {
    const email = nextEmail();
    const parent = await newUser('PARENT', email);
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
      await requestCode(email).expect(200);
      await settle();
      expect(emailCount(email)).toBe(0);
    } finally {
      await prisma.schoolSetting.update({
        where: { schoolId },
        data: { policies: before?.policies ?? {} },
      });
      await reader.invalidate(schoolId);
      await app.get(UserAuthPolicyService).invalidateUser(parent.id);
    }
  });

  it('lets the demo parent ask for a code and keep the password login', async () => {
    const res = await requestCode('parent@eschool.local').expect(200);
    expect(data(res)).toEqual({ ok: true, resendAfterSeconds: 60 });
    await login(app, 'parent@eschool.local');
  });
});
