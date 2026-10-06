import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface Child {
  id: string;
  name: string;
  className: string;
  sectionName: string;
}

interface Register {
  id: string | null;
  status: string;
  entries: {
    studentId: string;
    status: string | null;
    entryId: string | null;
  }[];
}

const isoDay = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

describe('Daily operations (e2e)', () => {
  let app: INestApplication<App>;
  const tokens: Record<string, string> = {};
  const t = (who: string) => as(app, tokens[who]);
  let ayesha: Child;
  let omar: Child;
  let fiveA: string;
  let classmate: string;
  const usedDates = new Set<string>();

  beforeAll(async () => {
    app = await createTestApp();
    for (const who of [
      'principal',
      'coordinator',
      'teacher',
      'newteacher',
      'helper',
      'parent',
    ]) {
      tokens[who] = (await login(app, `${who}@eschool.local`)).accessToken;
    }
    const me = data<{ children: Child[] }>(await t('parent').get('/me'));
    ayesha = me.children.find((c) => c.className === 'Class 5')!;
    omar = me.children.find((c) => c.className === 'Class 4')!;
    const sections = data<{ id: string; className: string; name: string }[]>(
      await t('principal').get('/sections?pageSize=100').expect(200),
    );
    fiveA = sections.find(
      (s) => s.className === 'Class 5' && s.name === 'A',
    )!.id;
  });

  afterAll(async () => {
    await app.close();
  });

  /** A past working day with no register yet (seed covers the last 11). */
  async function freeDate(): Promise<string> {
    for (let offset = -20; offset > -120; offset--) {
      const date = isoDay(offset);
      if (usedDates.has(date)) continue;
      const res = await t('teacher').get(
        `/attendance/registers?sectionId=${fiveA}&date=${date}`,
      );
      if (data<Register>(res).status !== 'UNMARKED') continue;
      const probe = await t('teacher').put('/attendance/registers', {
        sectionId: fiveA,
        date,
        entries: [],
      });
      if (probe.status === 200) {
        usedDates.add(date);
        return date;
      }
    }
    throw new Error('No free working day found');
  }

  it('teacher marks and submits 5-A; the parent sees the child; a second submitter gets 409', async () => {
    const date = await freeDate();
    const register = data<Register>(
      await t('teacher')
        .get(`/attendance/registers?sectionId=${fiveA}&date=${date}`)
        .expect(200),
    );
    classmate = register.entries.find(
      (e) => e.studentId !== ayesha.id,
    )!.studentId;
    const entries = register.entries.map((e) => ({
      studentId: e.studentId,
      status: e.studentId === ayesha.id ? 'ABSENT' : 'PRESENT',
    }));
    const draft = data<Register>(
      await t('teacher')
        .put('/attendance/registers', {
          sectionId: fiveA,
          date,
          entries,
          clientRequestId: `e2e-${date}-draft`,
        })
        .expect(200),
    );
    expect(draft.status).toBe('DRAFT');
    const submitted = data<Register>(
      await t('teacher')
        .post('/attendance/registers/submit', { sectionId: fiveA, date })
        .expect(200),
    );
    expect(submitted.status).toBe('SUBMITTED');

    const history = data<{ entries: { date: string; status: string }[] }>(
      await t('parent')
        .get(`/attendance/students/${ayesha.id}?from=${date}&to=${date}`)
        .expect(200),
    );
    expect(history.entries).toEqual([
      expect.objectContaining({ date, status: 'ABSENT' }),
    ]);

    const again = await t('coordinator')
      .post('/attendance/registers/submit', { sectionId: fiveA, date, entries })
      .expect(409);
    expect(errorCode(again)).toBe('ALREADY_SUBMITTED');
    expect(
      (again.body as { error: { details: Register } }).error.details.status,
    ).toBe('SUBMITTED');
  });

  it('a parent cannot read another child’s attendance (404)', async () => {
    const res = await t('parent')
      .get(`/attendance/students/${classmate}`)
      .expect(404);
    expect(errorCode(res)).toBe('NOT_FOUND');
  });

  it('a helper can only save drafts', async () => {
    const date = await freeDate();
    const roster = data<Register>(
      await t('helper')
        .get(`/attendance/registers?sectionId=${fiveA}&date=${date}`)
        .expect(200),
    );
    const saved = data<Register>(
      await t('helper')
        .put('/attendance/registers', {
          sectionId: fiveA,
          date,
          entries: roster.entries.map((e) => ({
            studentId: e.studentId,
            status: 'PRESENT',
          })),
        })
        .expect(200),
    );
    expect(saved.status).toBe('DRAFT');
    await t('helper')
      .post('/attendance/registers/submit', { sectionId: fiveA, date })
      .expect(403);

    const diary = data<
      { id: string; status: string; subject: { name: string } }[]
    >(
      await t('helper')
        .get(`/diary?sectionId=${fiveA}&from=${isoDay(-10)}&to=${isoDay(0)}`)
        .expect(200),
    );
    const published = diary.find((d) => d.status === 'PUBLISHED')!;
    await t('helper').post(`/diary/${published.id}/publish`).expect(403);
  });

  it('a probation teacher’s diary waits for review and is published after approval', async () => {
    const subjects = data<{ id: string; code: string }[]>(
      await t('principal').get('/subjects?pageSize=100').expect(200),
    );
    const sst = subjects.find((s) => s.code === 'SST')!;
    const seeded = data<{ date: string }[]>(
      await t('coordinator')
        .get(`/diary?sectionId=${fiveA}&from=${isoDay(-10)}&to=${isoDay(0)}`)
        .expect(200),
    );
    const date = seeded
      .map((d) => d.date)
      .sort()
      .reverse()[0];
    const draft = data<{ id: string; status: string }>(
      await t('newteacher')
        .put('/diary', {
          sectionId: fiveA,
          subjectId: sst.id,
          date,
          topics: 'Maps: کرہ ارض اور براعظم',
        })
        .expect(200),
    );
    const held = data<{ status: string; approvalId: string }>(
      await t('newteacher').post(`/diary/${draft.id}/publish`).expect(200),
    );
    expect(held.status).toBe('PENDING_REVIEW');
    const parentView = async () =>
      data<{ id: string; topics: string }[]>(
        await t('parent')
          .get(`/diary?sectionId=${fiveA}&date=${date}`)
          .expect(200),
      );
    expect((await parentView()).some((d) => d.id === draft.id)).toBe(false);

    await t('coordinator')
      .post(`/approvals/${held.approvalId}/decide`, { decision: 'APPROVED' })
      .expect(200);
    const visible = (await parentView()).find((d) => d.id === draft.id);
    expect(visible?.topics).toBe('Maps: کرہ ارض اور براعظم');
  });

  it('a complaint against the teacher is hidden from that teacher', async () => {
    const recipients = data<{ userId: string; role: string }[]>(
      await t('parent')
        .get(`/messages/recipients?studentId=${ayesha.id}`)
        .expect(200),
    );
    const teacherUserId = recipients.find(
      (r) => r.role === 'CLASS_TEACHER',
    )!.userId;
    const complaint = data<{ id: string; assignee: { id: string } | null }>(
      await t('parent')
        .post('/complaints', {
          category: 'STAFF_BEHAVIOUR',
          subject: 'Rude remark',
          description: 'The class teacher spoke harshly to my child.',
          studentId: ayesha.id,
          againstUserId: teacherUserId,
        })
        .expect(201),
    );
    expect(complaint.assignee?.id).not.toBe(teacherUserId);
    await t('teacher').get(`/complaints/${complaint.id}`).expect(404);
    for (const box of ['assigned', 'mine']) {
      const rows = data<{ id: string }[]>(
        await t('teacher')
          .get(`/complaints?box=${box}&pageSize=100`)
          .expect(200),
      );
      expect(rows.some((r) => r.id === complaint.id)).toBe(false);
    }
    await t('principal').get(`/complaints/${complaint.id}`).expect(200);
  });

  it('a declined consent keeps the child out of the participants (409)', async () => {
    const activities = data<{ id: string; title: string }[]>(
      await t('parent').get('/activities?pageSize=100').expect(200),
    );
    const sports = activities.find((a) => a.title === 'Annual Sports Day')!;
    await t('parent')
      .post(`/activities/${sports.id}/consents`, {
        studentId: ayesha.id,
        decision: 'DECLINED',
      })
      .expect(200);
    const res = await t('teacher')
      .put(`/activities/${sports.id}/participants`, {
        participants: [{ studentId: ayesha.id, role: 'Runner' }],
      })
      .expect(409);
    expect(errorCode(res)).toBe('CONFLICT');
  });

  it('an unauthorised picker is blocked (403)', async () => {
    const people = data<{ id: string }[]>(
      await t('principal')
        .get(`/students/${omar.id}/pickup-persons`)
        .expect(200),
    );
    const res = await t('principal')
      .post('/departures', {
        studentId: ayesha.id,
        pickedUpBy: { pickupPersonId: people[0].id },
      })
      .expect(403);
    expect(errorCode(res)).toBe('PICKUP_NOT_AUTHORIZED');
  });
});
