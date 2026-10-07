import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import {
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

interface SetupResult {
  school: { id: string; code: string };
  branch: { id: string; code: string; name: string };
  principal: { id: string; email: string; temporaryPassword?: string };
  session: { id: string; name: string } | null;
  counts: { classes: number; sections: number; subjects: number };
}

interface Checklist {
  branchId: string;
  complete: boolean;
  items: { key: string; done: boolean; count: number }[];
}

describe('School setup (e2e)', () => {
  let app: INestApplication<App>;
  let admin: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = (await login(app, 'admin@eschool.local')).accessToken;
  });

  afterAll(async () => {
    // Let the inline welcome-notification jobs finish before closing.
    await new Promise((r) => setTimeout(r, 500));
    await app.close();
  });

  const body = (code: string, email: string) => ({
    school: { code, name: `Setup ${code}` },
    principal: { name: 'Setup Principal', email },
    academics: { sectionsPerClass: 2 },
  });

  it('super admin sets up a school; the principal signs in and sees the checklist', async () => {
    const code = unique('SU');
    const email = `${code.toLowerCase()}@setup.local`;
    const res = await as(app, admin)
      .post('/schools/setup', body(code, email))
      .expect(201);
    const result = (res.body as { data: SetupResult }).data;
    expect(result.school.code).toBe(code);
    expect(result.branch).toMatchObject({ code: 'MAIN', name: 'Main Branch' });
    expect(result.counts).toEqual({ classes: 13, sections: 26, subjects: 8 });
    expect(result.session?.name).toMatch(/^\d{4}-\d{2}$/);
    const password = result.principal.temporaryPassword!;
    expect(password).toHaveLength(12);

    const branch = await as(app, admin)
      .get(`/branches/${result.branch.id}`)
      .expect(200);
    expect(
      (branch.body as { data: { principal: { id: string } } }).data.principal
        .id,
    ).toBe(result.principal.id);

    const tokens = await login(app, email, password);
    expect(tokens.mustChangePassword).toBe(true);
    const blocked = await as(app, tokens.accessToken)
      .get('/setup/checklist')
      .expect(403);
    expect(errorCode(blocked)).toBe('PASSWORD_CHANGE_REQUIRED');
    await as(app, tokens.accessToken)
      .post('/auth/password/change', {
        currentPassword: password,
        newPassword: 'Principal1234x',
      })
      .expect(200);

    const principal = (await login(app, email, 'Principal1234x')).accessToken;
    const own = await as(app, principal).get('/setup/checklist').expect(200);
    const checklist = (own.body as { data: Checklist }).data;
    expect(checklist.branchId).toBe(result.branch.id);
    expect(checklist.complete).toBe(false);
    const done = Object.fromEntries(
      checklist.items.map((i) => [i.key, [i.done, i.count]]),
    );
    expect(done).toEqual({
      session: [true, 1],
      classes: [true, 13],
      subjects: [true, 8],
      teachers: [false, 0],
      students: [false, 0],
      timetable: [false, 0],
      feePlan: [false, 0],
    });

    // Super admin reads it per branch; branchId is required for them.
    await as(app, admin)
      .get(`/setup/checklist?branchId=${result.branch.id}`)
      .expect(200);
    await as(app, admin).get('/setup/checklist').expect(400);
  });

  it('a principal cannot set up schools or read another branch checklist', async () => {
    const principal = (await login(app, 'principal@eschool.local')).accessToken;
    await as(app, principal)
      .post('/schools/setup', body(unique('NP'), 'np@setup.local'))
      .expect(403);

    const other = await as(app, admin)
      .post(
        '/schools/setup',
        body(unique('OB'), `${unique('ob').toLowerCase()}@setup.local`),
      )
      .expect(201);
    const branchId = (other.body as { data: SetupResult }).data.branch.id;
    const res = await as(app, principal)
      .get(`/setup/checklist?branchId=${branchId}`)
      .expect(403);
    expect(errorCode(res)).toBe('FORBIDDEN_SCOPE');

    const teacher = (await login(app, 'teacher@eschool.local')).accessToken;
    await as(app, teacher).get('/setup/checklist').expect(403);
  });

  it('rejects a duplicate code with 409 SCHOOL_CODE_TAKEN', async () => {
    const code = unique('DU');
    await as(app, admin)
      .post('/schools/setup', body(code, `${code.toLowerCase()}@setup.local`))
      .expect(201);
    const res = await as(app, admin)
      .post('/schools/setup', body(code, `${code.toLowerCase()}2@setup.local`))
      .expect(409);
    expect(errorCode(res)).toBe('SCHOOL_CODE_TAKEN');
  });

  it('rolls everything back when the principal email is taken', async () => {
    const code = unique('RB');
    const res = await as(app, admin)
      .post('/schools/setup', body(code, 'admin@eschool.local'))
      .expect(409);
    expect(errorCode(res)).toBe('USER_EMAIL_TAKEN');
    // Nothing was kept: the same code is still free.
    await as(app, admin)
      .post('/schools/setup', body(code, `${code.toLowerCase()}@setup.local`))
      .expect(201);
  });

  it('reports nested field errors with their path', async () => {
    const res = await as(app, admin)
      .post('/schools/setup', {
        school: { code: 'bad code', name: 'X' },
        principal: { name: 'P' },
      })
      .expect(400);
    expect(errorCode(res)).toBe('VALIDATION_FAILED');
    const details = (res.body as { error: { details: string[] } }).error
      .details;
    expect(details.some((d) => d.startsWith('school.code'))).toBe(true);
  });
});
