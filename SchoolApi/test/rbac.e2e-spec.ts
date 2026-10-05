import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import {
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

describe('RBAC and scope (e2e)', () => {
  let app: INestApplication<App>;
  let admin: string;
  let principal: string;
  let teacher: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = (await login(app, 'admin@eschool.local')).accessToken;
    principal = (await login(app, 'principal@eschool.local')).accessToken;
    teacher = (await login(app, 'teacher@eschool.local')).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  async function otherBranch(): Promise<{
    schoolId: string;
    branchId: string;
  }> {
    const school = await as(app, admin)
      .post('/schools', { code: unique('S'), name: 'Other School' })
      .expect(201);
    const schoolId = (school.body as { data: { id: string } }).data.id;
    const branch = await as(app, admin)
      .post('/branches', { schoolId, code: 'NORTH', name: 'North Branch' })
      .expect(201);
    return {
      schoolId,
      branchId: (branch.body as { data: { id: string } }).data.id,
    };
  }

  it('principal cannot see another branch (FORBIDDEN_SCOPE)', async () => {
    const { branchId, schoolId } = await otherBranch();
    const res = await as(app, principal)
      .get(`/branches/${branchId}`)
      .expect(403);
    expect(errorCode(res)).toBe('FORBIDDEN_SCOPE');

    const schools = await as(app, principal).get('/schools').expect(200);
    const ids = (schools.body as { data: { id: string }[] }).data.map(
      (s) => s.id,
    );
    expect(ids).not.toContain(schoolId);
    expect(ids).toHaveLength(1);
  });

  it('teacher cannot create schools (FORBIDDEN)', async () => {
    const res = await as(app, teacher)
      .post('/schools', { code: unique('T'), name: 'Nope' })
      .expect(403);
    expect(errorCode(res)).toBe('FORBIDDEN');
  });

  it('principal cannot grant PRINCIPAL, and cannot grant outside the branch', async () => {
    const own = await as(app, principal).get('/branches').expect(200);
    const branchId = (own.body as { data: { id: string }[] }).data[0].id;
    const promote = await as(app, principal)
      .post('/users', {
        name: 'Wannabe',
        email: `${unique('p').toLowerCase()}@eschool.local`,
        assignments: [{ roleKey: 'PRINCIPAL', scopeType: 'BRANCH', branchId }],
      })
      .expect(403);
    expect(errorCode(promote)).toBe('FORBIDDEN');

    const { branchId: foreign } = await otherBranch();
    const outside = await as(app, principal)
      .post('/users', {
        name: 'Elsewhere',
        email: `${unique('e').toLowerCase()}@eschool.local`,
        assignments: [
          { roleKey: 'TEACHER', scopeType: 'BRANCH', branchId: foreign },
        ],
      })
      .expect(403);
    expect(errorCode(outside)).toBe('FORBIDDEN_SCOPE');
  });

  it('principal creates branch staff and gets a temporary password', async () => {
    const own = await as(app, principal).get('/branches').expect(200);
    const branchId = (own.body as { data: { id: string }[] }).data[0].id;
    const res = await as(app, principal)
      .post('/users', {
        name: 'New Helper',
        phone: '+92300' + Date.now().toString().slice(-7),
        assignments: [{ roleKey: 'HELPER', scopeType: 'BRANCH', branchId }],
      })
      .expect(201);
    const created = (
      res.body as {
        data: {
          temporaryPassword?: string;
          mustChangePassword: boolean;
          roles: string[];
        };
      }
    ).data;
    expect(created.temporaryPassword).toHaveLength(12);
    expect(created.mustChangePassword).toBe(true);
    expect(created.roles).toEqual(['HELPER']);

    const list = await as(app, principal)
      .get('/users?pageSize=100')
      .expect(200);
    const roles = (list.body as { data: { roles: string[] }[] }).data.flatMap(
      (u) => u.roles,
    );
    expect(roles).not.toContain('SUPER_ADMIN');
    expect(roles).not.toContain('PRINCIPAL');
  });

  it('writes audit entries for mutations', async () => {
    const res = await as(app, admin)
      .get('/audit?entityType=School&pageSize=5')
      .expect(200);
    const entries = (
      res.body as { data: { action: string; actor: { name: string } }[] }
    ).data;
    expect(entries.some((e) => e.action === 'school.create')).toBe(true);
  });
});
