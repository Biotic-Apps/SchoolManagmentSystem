import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import {
  API,
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

const ROLES: [string, string][] = [
  ['admin@eschool.local', 'SUPER_ADMIN'],
  ['principal@eschool.local', 'PRINCIPAL'],
  ['coordinator@eschool.local', 'COORDINATOR'],
  ['teacher@eschool.local', 'TEACHER'],
  ['accountant@eschool.local', 'ACCOUNTANT'],
  ['parent@eschool.local', 'PARENT'],
  ['teacherparent@eschool.local', 'TEACHER'],
];

interface Me {
  activeRole: string;
  roles: string[];
  permissions: string[];
  assignments: unknown[];
  children: unknown[];
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let admin: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = (await login(app, 'admin@eschool.local')).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createStaff(
    password = 'Start1234x',
  ): Promise<{ id: string; email: string }> {
    const branches = await as(app, admin).get('/branches').expect(200);
    const branchId = (branches.body as { data: { id: string }[] }).data[0].id;
    const email = `${unique('staff').toLowerCase()}@eschool.local`;
    const res = await as(app, admin)
      .post('/users', {
        name: 'E2E Staff',
        email,
        password,
        assignments: [{ roleKey: 'TEACHER', scopeType: 'BRANCH', branchId }],
      })
      .expect(201);
    return { id: (res.body as { data: { id: string } }).data.id, email };
  }

  it.each(ROLES)('login → /me works for %s', async (identifier, role) => {
    const tokens = await login(app, identifier);
    const res = await as(app, tokens.accessToken).get('/me').expect(200);
    const me = (res.body as { data: Me }).data;
    expect(me.activeRole).toBe(role);
    expect(me.permissions).toContain('dashboard.view');
    const children: Record<string, number> = {
      'parent@eschool.local': 2,
      'teacherparent@eschool.local': 1,
    };
    expect(me.children).toHaveLength(children[identifier] ?? 0);
  });

  it('switches role context with X-Active-Role', async () => {
    const { accessToken } = await login(app, 'teacherparent@eschool.local');
    const res = await as(app, accessToken, 'PARENT').get('/me').expect(200);
    const me = (res.body as { data: Me }).data;
    expect(me.roles).toEqual(['TEACHER', 'PARENT']);
    expect(me.activeRole).toBe('PARENT');
    expect(me.permissions).not.toContain('attendance.edit');

    const denied = await as(app, accessToken, 'PRINCIPAL')
      .get('/me')
      .expect(403);
    expect(errorCode(denied)).toBe('FORBIDDEN');
  });

  it('rejects wrong passwords with INVALID_CREDENTIALS', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({
        identifier: 'teacher@eschool.local',
        password: 'wrong-pass1',
        platform: 'WEB',
      })
      .expect(401);
    expect(errorCode(res)).toBe('INVALID_CREDENTIALS');
  });

  it('rotates refresh tokens and revokes the family on reuse', async () => {
    const first = await login(app, 'coordinator@eschool.local');
    const server = app.getHttpServer();

    const rotated = await request(server)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: first.refreshToken })
      .expect(200);
    const second = (
      rotated.body as { data: { refreshToken: string; accessToken: string } }
    ).data;
    expect(second.refreshToken).not.toBe(first.refreshToken);
    await as(app, second.accessToken).get('/me').expect(200);

    const reuse = await request(server)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: first.refreshToken })
      .expect(401);
    expect(errorCode(reuse)).toBe('SESSION_REVOKED');

    const afterReuse = await request(server)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: second.refreshToken })
      .expect(401);
    expect(errorCode(afterReuse)).toBe('SESSION_REVOKED');
    const access = await as(app, second.accessToken).get('/me').expect(401);
    expect(errorCode(access)).toBe('SESSION_REVOKED');
  });

  it('lists sessions and logs out the current one', async () => {
    const tokens = await login(app, 'accountant@eschool.local');
    const list = await as(app, tokens.accessToken)
      .get('/auth/sessions')
      .expect(200);
    const sessions = (list.body as { data: { current: boolean }[] }).data;
    expect(sessions.filter((s) => s.current)).toHaveLength(1);

    await as(app, tokens.accessToken).post('/auth/logout').expect(200);
    const after = await as(app, tokens.accessToken).get('/me').expect(401);
    expect(errorCode(after)).toBe('SESSION_REVOKED');
  });

  it('requires a password change before other routes', async () => {
    const staff = await createStaff();
    const tokens = await login(app, staff.email, 'Start1234x');
    expect(tokens.mustChangePassword).toBe(true);

    await as(app, tokens.accessToken).get('/me').expect(200);
    const blocked = await as(app, tokens.accessToken)
      .get('/dashboard/summary')
      .expect(403);
    expect(errorCode(blocked)).toBe('PASSWORD_CHANGE_REQUIRED');

    await as(app, tokens.accessToken)
      .post('/auth/password/change', {
        currentPassword: 'Start1234x',
        newPassword: 'Changed1234x',
      })
      .expect(200);
    await as(app, tokens.accessToken).get('/dashboard/summary').expect(200);
  });

  it('rejects a disabled user immediately', async () => {
    const staff = await createStaff();
    const tokens = await login(app, staff.email, 'Start1234x');
    await as(app, tokens.accessToken).get('/me').expect(200);

    await as(app, admin).post(`/users/${staff.id}/disable`).expect(200);

    const res = await as(app, tokens.accessToken).get('/me').expect(403);
    expect(errorCode(res)).toBe('ACCOUNT_DISABLED');
    const relogin = await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({
        identifier: staff.email,
        password: 'Start1234x',
        platform: 'WEB',
      })
      .expect(403);
    expect(errorCode(relogin)).toBe('ACCOUNT_DISABLED');
  });

  it('locks an account after five failed attempts', async () => {
    const staff = await createStaff();
    const attempt = () =>
      request(app.getHttpServer()).post(`${API}/auth/login`).send({
        identifier: staff.email,
        password: 'nope12345',
        platform: 'ANDROID',
      });
    for (let i = 0; i < 4; i++)
      expect(errorCode(await attempt().expect(401))).toBe(
        'INVALID_CREDENTIALS',
      );
    expect(errorCode(await attempt().expect(423))).toBe('ACCOUNT_LOCKED');
    const correct = await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({
        identifier: staff.email,
        password: 'Start1234x',
        platform: 'WEB',
      })
      .expect(423);
    expect(errorCode(correct)).toBe('ACCOUNT_LOCKED');
  });

  it('password forgot never reveals whether an account exists', async () => {
    const server = app.getHttpServer();
    await request(server)
      .post(`${API}/auth/password/forgot`)
      .send({ identifier: 'nobody@eschool.local' })
      .expect(200);
    await request(server)
      .post(`${API}/auth/password/forgot`)
      .send({ identifier: 'teacher@eschool.local' })
      .expect(200);
  });
});
