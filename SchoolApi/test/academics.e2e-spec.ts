import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import {
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

interface Page<T> {
  data: T[];
}

describe('Sessions and sections (e2e)', () => {
  let app: INestApplication<App>;
  let admin: string;
  let principal: string;
  let branchId: string;
  let schoolId: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = (await login(app, 'admin@eschool.local')).accessToken;
    principal = (await login(app, 'principal@eschool.local')).accessToken;
    const branches = await as(app, principal).get('/branches').expect(200);
    const branch = (branches.body as Page<{ id: string; schoolId: string }>)
      .data[0];
    branchId = branch.id;
    schoolId = branch.schoolId;
  });

  afterAll(async () => {
    await app.close();
  });

  const first = <T>(res: { body: unknown }) => (res.body as Page<T>).data[0];

  it('duplicate section in the same session and class → 409', async () => {
    const section = first<{ sessionId: string; classId: string }>(
      await as(app, principal)
        .get(`/sections?branchId=${branchId}&search=A`)
        .expect(200),
    );
    const res = await as(app, principal)
      .post('/sections', {
        branchId,
        sessionId: section.sessionId,
        classId: section.classId,
        name: 'A',
        capacity: 30,
      })
      .expect(409);
    expect(errorCode(res)).toBe('CONFLICT');
  });

  it('second ACTIVE session in a branch → 409', async () => {
    const created = await as(app, principal)
      .post('/sessions', {
        branchId,
        name: unique('Y'),
        startDate: '2027-04-01',
        endDate: '2028-03-31',
      })
      .expect(201);
    const id = (created.body as { data: { id: string; status: string } }).data
      .id;
    const res = await as(app, principal)
      .post(`/sessions/${id}/activate`)
      .expect(409);
    expect(errorCode(res)).toBe('CONFLICT');
  });

  it('closed session is read-only → 423', async () => {
    const branch = await as(app, admin)
      .post('/branches', { schoolId, code: unique('B'), name: 'Closed Branch' })
      .expect(201);
    const newBranchId = (branch.body as { data: { id: string } }).data.id;
    const session = await as(app, admin)
      .post('/sessions', {
        branchId: newBranchId,
        name: '2025-26',
        startDate: '2025-04-01',
        endDate: '2026-03-31',
      })
      .expect(201);
    const sessionId = (session.body as { data: { id: string } }).data.id;
    await as(app, admin).post(`/sessions/${sessionId}/activate`).expect(200);
    await as(app, admin)
      .post(`/sessions/${sessionId}/terms`, {
        name: 'Term 1',
        startDate: '2025-04-01',
        endDate: '2025-09-30',
      })
      .expect(201);
    const closed = await as(app, admin)
      .post(`/sessions/${sessionId}/close`)
      .expect(200);
    expect((closed.body as { data: { status: string } }).data.status).toBe(
      'CLOSED',
    );

    const edit = await as(app, admin)
      .patch(`/sessions/${sessionId}`, { name: 'Renamed' })
      .expect(423);
    expect(errorCode(edit)).toBe('RECORD_LOCKED');

    const schoolClass = first<{ id: string }>(
      await as(app, admin).get(`/classes?schoolId=${schoolId}`).expect(200),
    );
    const section = await as(app, admin)
      .post('/sections', {
        branchId: newBranchId,
        sessionId,
        classId: schoolClass.id,
        name: 'Z',
        capacity: 20,
      })
      .expect(423);
    expect(errorCode(section)).toBe('RECORD_LOCKED');
  });

  it('terms must fit the session and not overlap', async () => {
    const session = first<{ id: string }>(
      await as(app, principal)
        .get(`/sessions?branchId=${branchId}&status=ACTIVE`)
        .expect(200),
    );
    const overlap = await as(app, principal)
      .post(`/sessions/${session.id}/terms`, {
        name: 'Overlap',
        startDate: '2026-05-01',
        endDate: '2026-06-01',
      })
      .expect(409);
    expect(errorCode(overlap)).toBe('CONFLICT');
    const outside = await as(app, principal)
      .post(`/sessions/${session.id}/terms`, {
        name: 'Outside',
        startDate: '2030-01-01',
        endDate: '2030-02-01',
      })
      .expect(400);
    expect(errorCode(outside)).toBe('VALIDATION_FAILED');
  });

  it('dashboard summary is scoped', async () => {
    const res = await as(app, principal).get('/dashboard/summary').expect(200);
    const summary = (
      res.body as {
        data: { schools: number; branches: number; sections: number };
      }
    ).data;
    expect(summary.schools).toBe(1);
    expect(summary.branches).toBe(1);
    expect(summary.sections).toBeGreaterThanOrEqual(10);
  });

  it('branch settings merge defaults and validate values', async () => {
    const settings = await as(app, principal)
      .get(`/branches/${branchId}/settings`)
      .expect(200);
    expect(
      (settings.body as { data: Record<string, unknown> }).data[
        'diary.moderation'
      ],
    ).toBe(false);
    const bad = await as(app, principal)
      .patch(`/branches/${branchId}/settings`, {
        'attendance.lockTime': '25:99',
      })
      .expect(400);
    expect(errorCode(bad)).toBe('VALIDATION_FAILED');
  });
});
