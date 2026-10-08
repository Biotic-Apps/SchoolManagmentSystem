import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface SectionRow {
  id: string;
  branchId: string;
  sessionId: string;
  className: string;
  name: string;
}

describe('Staff, timetable and syllabus (e2e)', () => {
  let app: INestApplication<App>;
  let principal: string;
  let sections: SectionRow[];
  const section = (cls: number, name: string) =>
    sections.find((s) => s.className === `Class ${cls}` && s.name === name)!;

  beforeAll(async () => {
    app = await createTestApp();
    principal = (await login(app, 'principal@eschool.local')).accessToken;
    sections = data<SectionRow[]>(
      await as(app, principal).get('/sections?pageSize=100').expect(200),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const staffId = async (email: string) => {
    const rows = data<{ id: string; name: string; userId: string }[]>(
      await as(app, principal).get(`/staff?pageSize=100`).expect(200),
    );
    const users = data<{ id: string; email: string }[]>(
      await as(app, principal)
        .get(`/users?pageSize=100&search=${encodeURIComponent(email)}`)
        .expect(200),
    );
    const user = users.find((u) => u.email === email)!;
    return rows.find((s) => s.userId === user.id)!.id;
  };

  it('a second class teacher for a section is a 409', async () => {
    const fiveA = section(5, 'A');
    const res = await as(app, principal)
      .post(`/staff/${await staffId('teacher2@eschool.local')}/assignments`, {
        kind: 'CLASS_TEACHER',
        sessionId: fiveA.sessionId,
        branchId: fiveA.branchId,
        sectionId: fiveA.id,
      })
      .expect(409);
    expect(errorCode(res)).toBe('CONFLICT');
  });

  it('publishing a timetable with a double-booked teacher is a 409 with conflicts', async () => {
    const fourA = section(4, 'A');
    const subjects = data<{ id: string; code: string }[]>(
      await as(app, principal).get('/subjects?pageSize=100').expect(200),
    );
    const math = subjects.find((s) => s.code === 'MATH')!;
    await as(app, principal)
      .put(`/timetables/${fourA.id}/slots`, {
        sessionId: fourA.sessionId,
        slots: [
          {
            day: 1,
            periodIndex: 1,
            subjectId: math.id,
            staffId: await staffId('teacher@eschool.local'),
          },
        ],
      })
      .expect(200);
    const check = data<{ conflicts: { type: string }[] }>(
      await as(app, principal)
        .post(`/timetables/${fourA.id}/check`)
        .expect(200),
    );
    expect(check.conflicts.map((c) => c.type)).toContain(
      'TEACHER_DOUBLE_BOOKED',
    );
    const res = await as(app, principal)
      .post(`/timetables/${fourA.id}/publish`)
      .expect(409);
    expect(errorCode(res)).toBe('TIMETABLE_CONFLICTS');
    const details = (res.body as { error: { details: { severity: string }[] } })
      .error.details;
    expect(details.length).toBeGreaterThan(0);
    expect(details.every((c) => c.severity === 'error')).toBe(true);
  });

  it('teacher sees own week and the published 5-A timetable', async () => {
    const teacher = (await login(app, 'teacher@eschool.local')).accessToken;
    const week = data<{ subject: { name: string } }[]>(
      await as(app, teacher)
        .get('/timetables/me?weekOf=2026-10-05')
        .expect(200),
    );
    expect(week.length).toBeGreaterThan(0);
    const tt = data<{ status: string; slots: unknown[] }>(
      await as(app, teacher)
        .get(`/timetables?sectionId=${section(5, 'A').id}`)
        .expect(200),
    );
    expect(tt.status).toBe('PUBLISHED');
    expect(tt.slots).toHaveLength(42);
  });

  it('probation teacher progress waits for the coordinator, then applies', async () => {
    const newTeacher = (await login(app, 'newteacher@eschool.local'))
      .accessToken;
    const coordinator = (await login(app, 'coordinator@eschool.local'))
      .accessToken;
    const plans = data<
      {
        subjectName: string;
        chapters: { topics: { id: string; status: string }[] }[];
      }[]
    >(
      await as(app, newTeacher)
        .get(`/syllabus-plans?sectionId=${section(5, 'A').id}`)
        .expect(200),
    );
    const english = plans.find((p) => p.subjectName === 'English')!;
    const topicId = english.chapters[0].topics[0].id;

    const held = data<{
      status: string;
      approvalId: string;
      topic: { status: string; pendingReview: boolean };
    }>(
      await as(app, newTeacher)
        .post(`/syllabus-topics/${topicId}/progress`, { status: 'IN_PROGRESS' })
        .expect(200),
    );
    expect(held.status).toBe('PENDING_REVIEW');
    expect(held.topic).toEqual(
      expect.objectContaining({ status: 'NOT_STARTED', pendingReview: true }),
    );

    const approval = data<{ type: string; status: string }>(
      await as(app, coordinator)
        .post(`/approvals/${held.approvalId}/decide`, { decision: 'APPROVED' })
        .expect(200),
    );
    expect(approval).toEqual(
      expect.objectContaining({ type: 'PROBATION_REVIEW', status: 'APPROVED' }),
    );

    const after = data<typeof plans>(
      await as(app, newTeacher)
        .get(`/syllabus-plans?sectionId=${section(5, 'A').id}`)
        .expect(200),
    );
    const topic = after.find((p) => p.subjectName === 'English')!.chapters[0]
      .topics[0];
    expect(topic).toEqual(
      expect.objectContaining({ status: 'IN_PROGRESS', pendingReview: false }),
    );
  });

  it('a teacher outside the subject cannot update progress', async () => {
    const teacher3 = (await login(app, 'teacher3@eschool.local')).accessToken;
    const principalPlans = data<
      { subjectName: string; chapters: { topics: { id: string }[] }[] }[]
    >(
      await as(app, principal)
        .get(`/syllabus-plans?sectionId=${section(5, 'A').id}`)
        .expect(200),
    );
    const mathTopic = principalPlans.find(
      (p) => p.subjectName === 'Mathematics',
    )!.chapters[0].topics[0];
    await as(app, teacher3)
      .post(`/syllabus-topics/${mathTopic.id}/progress`, {
        status: 'COMPLETED',
      })
      .expect(403);
  });
});
