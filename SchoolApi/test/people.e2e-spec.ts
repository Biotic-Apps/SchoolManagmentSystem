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

interface StudentRow {
  id: string;
  name: string;
  className: string;
  sectionName: string;
}

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

describe('People scope (e2e)', () => {
  let app: INestApplication<App>;
  let principal: string;
  let teacher: string;
  let parent: string;

  beforeAll(async () => {
    app = await createTestApp();
    principal = (await login(app, 'principal@eschool.local')).accessToken;
    teacher = (await login(app, 'teacher@eschool.local')).accessToken;
    parent = (await login(app, 'parent@eschool.local')).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const allStudents = async (token: string) =>
    data<StudentRow[]>(
      await as(app, token).get('/students?pageSize=100').expect(200),
    );

  it('/me lists the parent’s two verified children', async () => {
    const me = data<{
      children: {
        name: string;
        className: string;
        sectionName: string;
        admissionNo: string;
      }[];
    }>(await as(app, parent).get('/me').expect(200));
    expect(me.children).toHaveLength(2);
    expect(
      me.children.map((c) => `${c.className}-${c.sectionName}`).sort(),
    ).toEqual(['Class 4-B', 'Class 5-A']);
    expect(me.children[0].admissionNo).toMatch(/^BRIGHT-2026-\d{4}$/);
  });

  it('parent sees only linked children; others are 404', async () => {
    const own = await allStudents(parent);
    expect(own).toHaveLength(2);
    const everyone = await allStudents(principal);
    const stranger = everyone.find((s) => !own.some((o) => o.id === s.id))!;
    await as(app, parent).get(`/students/${own[0].id}`).expect(200);
    const res = await as(app, parent)
      .get(`/students/${stranger.id}`)
      .expect(404);
    expect(errorCode(res)).toBe('NOT_FOUND');
  });

  it('teacher sees only assigned sections (5-A class teacher, 5-B maths)', async () => {
    const rows = await allStudents(teacher);
    expect(rows).toHaveLength(20);
    expect(new Set(rows.map((s) => `${s.className}-${s.sectionName}`))).toEqual(
      new Set(['Class 5-A', 'Class 5-B']),
    );
    const other = (await allStudents(principal)).find(
      (s) => s.className === 'Class 4',
    )!;
    const res = await as(app, teacher).get(`/students/${other.id}`).expect(403);
    expect(errorCode(res)).toBe('FORBIDDEN_SCOPE');
  });

  it('teacher dashboard counts only own sections and students', async () => {
    const summary = data<{ sections: number; students: number }>(
      await as(app, teacher).get('/dashboard/summary').expect(200),
    );
    expect(summary.sections).toBe(2);
    expect(summary.students).toBe(20);
  });

  it('principal sees the whole branch with guardians and class teachers', async () => {
    expect((await allStudents(principal)).length).toBeGreaterThanOrEqual(40);
    const sections = data<
      {
        name: string;
        className: string;
        classTeacher: { name: string } | null;
        studentCount: number;
      }[]
    >(await as(app, principal).get('/sections?pageSize=100').expect(200));
    const fiveA = sections.find(
      (s) => s.className === 'Class 5' && s.name === 'A',
    )!;
    expect(fiveA.classTeacher?.name).toBe('Demo Teacher');
    expect(fiveA.studentCount).toBeGreaterThanOrEqual(10);
  });

  describe('sign-in for existing staff', () => {
    const tryLogin = (identifier: string, password: string) =>
      request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ identifier, password, platform: 'WEB', deviceName: 'e2e' });

    it('creates a login later, forces a change, rejects twice, resets', async () => {
      const someone = data<{ branchId: string }[]>(
        await as(app, principal).get('/staff?pageSize=1').expect(200),
      )[0];
      const email = `${unique('signin').toLowerCase()}@e2e.local`;
      const created = data<{ staff: { id: string; userId: string | null } }>(
        await as(app, principal)
          .post('/staff', {
            name: 'Later Login',
            email,
            designation: 'HELPER',
            joinDate: '2026-04-01',
            branchId: someone.branchId,
            createAccount: false,
          })
          .expect(201),
      ).staff;
      expect(created.userId).toBeNull();

      const denied = await as(app, teacher)
        .post(`/staff/${created.id}/account`, {})
        .expect(403);
      expect(errorCode(denied)).toBe('FORBIDDEN');

      const account = data<{ userId: string; temporaryPassword: string }>(
        await as(app, principal)
          .post(`/staff/${created.id}/account`, {})
          .expect(201),
      );
      expect(account.temporaryPassword).toBeTruthy();
      const detail = data<{
        userId: string;
        roles: string[];
        login: { email: string };
      }>(await as(app, principal).get(`/staff/${created.id}`).expect(200));
      expect(detail.userId).toBe(account.userId);
      expect(detail.roles).toEqual(['HELPER']);
      expect(detail.login.email).toBe(email);

      const tokens = await login(app, email, account.temporaryPassword);
      expect(tokens.mustChangePassword).toBe(true);
      await as(app, tokens.accessToken)
        .post('/auth/password/change', {
          currentPassword: account.temporaryPassword,
          newPassword: 'Changed1234x',
        })
        .expect(200);

      const again = await as(app, principal)
        .post(`/staff/${created.id}/account`, {})
        .expect(409);
      expect(errorCode(again)).toBe('CONFLICT');

      const reset = data<{ temporaryPassword: string }>(
        await as(app, principal)
          .post(`/staff/${created.id}/account/reset-password`)
          .expect(200),
      );
      await tryLogin(email, 'Changed1234x').expect(401);
      const after = await login(app, email, reset.temporaryPassword);
      expect(after.mustChangePassword).toBe(true);
    });
  });
});
