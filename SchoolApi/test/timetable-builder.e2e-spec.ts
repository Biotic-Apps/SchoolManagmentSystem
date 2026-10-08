import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import {
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface SectionRow {
  id: string;
  branchId: string;
  sessionId: string;
  classId: string;
  className: string;
  name: string;
}
interface Cell {
  state: string;
  canPublish: boolean;
  publishBlockedReason: string | null;
  allocated: boolean;
  conflicts: { type: string; severity: string }[];
}
interface Timetable {
  state: string;
  status: string | null;
  version: number;
  canEdit: boolean;
  canPublish: boolean;
  publishBlockedReason: string | null;
  draftSlotCount: number;
  slots: { day: number; periodIndex: number }[];
}

/** academics-timetable-contract: setup → curriculum → allocation → autosave → conflicts → publish. */
describe('Class setup and timetable builder (e2e)', () => {
  let app: INestApplication<App>;
  let admin: string;
  let principal: string;
  let coordinator: string;
  let teacher: string;
  let sections: SectionRow[];
  let subjects: Map<string, string>;
  const section = (cls: number, name: string) =>
    sections.find((s) => s.className === `Class ${cls}` && s.name === name)!;

  const staffId = async (email: string) => {
    const users = data<{ id: string; email: string }[]>(
      await as(app, principal)
        .get(`/users?pageSize=100&search=${encodeURIComponent(email)}`)
        .expect(200),
    );
    const staff = data<{ id: string; userId: string }[]>(
      await as(app, principal).get('/staff?pageSize=100').expect(200),
    );
    const user = users.find((u) => u.email === email)!;
    return staff.find((s) => s.userId === user.id)!.id;
  };

  beforeAll(async () => {
    app = await createTestApp();
    admin = (await login(app, 'admin@eschool.local')).accessToken;
    principal = (await login(app, 'principal@eschool.local')).accessToken;
    coordinator = (await login(app, 'coordinator@eschool.local')).accessToken;
    teacher = (await login(app, 'teacher@eschool.local')).accessToken;
    sections = data<SectionRow[]>(
      await as(app, principal).get('/sections?pageSize=100').expect(200),
    );
    const rows = data<{ id: string; code: string }[]>(
      await as(app, principal).get('/subjects?pageSize=100').expect(200),
    );
    subjects = new Map(rows.map((s) => [s.code, s.id]));
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 300));
    await app.close();
  });

  it('setup wizard creates per-class sections, groups, curricula and a Friday bell', async () => {
    const code = unique('TT');
    const res = await as(app, admin)
      .post('/schools/setup', {
        school: { code, name: `Timetable ${code}` },
        principal: { name: 'TT Principal', email: `${code}@tt.local` },
        academics: {
          classes: [
            {
              name: 'Playgroup',
              level: 'EARLY',
              sections: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
              subjects: [{ name: 'English', periodsPerWeek: 6 }],
            },
            {
              name: 'Class 9',
              level: 'MATRIC',
              sections: [
                { name: 'A', group: 'Science' },
                { name: 'B', group: 'Arts' },
              ],
              subjects: [
                { name: 'English', periodsPerWeek: 6 },
                { name: 'Physics', periodsPerWeek: 6, group: 'Science' },
                { name: 'Civics', periodsPerWeek: 6, group: 'Arts' },
              ],
            },
          ],
          bellSchedule: {
            startTime: '08:00',
            periodMinutes: 40,
            periodsPerDay: 8,
            breakAfter: 4,
            breakMinutes: 30,
            friday: { periodMinutes: 35, periodsPerDay: 6, breakMinutes: 15 },
          },
        },
      })
      .expect(201);
    const result = data<{
      branch: { id: string };
      counts: Record<string, number>;
    }>(res);
    expect(result.counts).toMatchObject({
      classes: 2,
      sections: 5,
      subjects: 3,
      classSubjects: 4,
    });

    const overview = data<
      {
        name: string;
        sections: { id: string; name: string; group: string | null }[];
        subjects: { name: string; group: string | null }[];
        unallocated: number;
      }[]
    >(
      await as(app, admin)
        .get(`/classes/overview?branchId=${result.branch.id}`)
        .expect(200),
    );
    const nine = overview.find((c) => c.name === 'Class 9')!;
    expect(nine.sections.map((s) => [s.name, s.group])).toEqual([
      ['A', 'Science'],
      ['B', 'Arts'],
    ]);
    expect(nine.unallocated).toBe(4);

    const bell = data<{ days: Record<string, { endTime: string }[]> }>(
      await as(app, admin)
        .get(`/branches/${result.branch.id}/bell-schedule`)
        .expect(200),
    );
    expect(bell.days['5'].at(-1)?.endTime).toBe('11:45');

    // A principal of another branch can neither read its class setup nor edit its timetable.
    await as(app, principal)
      .get(`/classes/overview?branchId=${result.branch.id}`)
      .expect(403);
    await as(app, principal)
      .put(`/timetables/${nine.sections[0].id}/slots/1/1`, {
        subjectId: subjects.get('ENG'),
        staffId: await staffId('teacher@eschool.local'),
      })
      .expect(403);
  });

  it('class curriculum: periods/week, order, and SUBJECT_IN_USE', async () => {
    const classId = section(3, 'A').classId;
    const codes = ['MATH', 'ENG', 'URDU', 'SCI', 'ISL', 'SST', 'COMP'];
    const saved = data<
      { code: string; periodsPerWeek: number; sortOrder: number }[]
    >(
      await as(app, principal)
        .put(`/classes/${classId}/subjects`, {
          items: codes.map((c) => ({
            subjectId: subjects.get(c),
            periodsPerWeek: c === 'MATH' ? 2 : 6,
          })),
        })
        .expect(200),
    );
    expect(saved.map((s) => s.code)).toEqual(codes);
    expect(saved[0]).toMatchObject({ periodsPerWeek: 2, sortOrder: 0 });

    const fiveClass = section(5, 'A').classId;
    const res = await as(app, principal)
      .put(`/classes/${fiveClass}/subjects`, {
        subjectIds: codes
          .filter((c) => c !== 'MATH')
          .map((c) => subjects.get(c)),
      })
      .expect(409);
    expect(errorCode(res)).toBe('SUBJECT_IN_USE');
  });

  it('allocation, autosave, conflicts and the publish lifecycle', async () => {
    const threeA = section(3, 'A');
    const threeB = section(3, 'B');
    const math = subjects.get('MATH')!;
    const teacher3 = await staffId('teacher3@eschool.local');

    const empty = data<Timetable>(
      await as(app, principal)
        .get(`/timetables?sectionId=${threeA.id}`)
        .expect(200),
    );
    expect(empty).toMatchObject({
      state: 'EMPTY',
      status: null,
      canPublish: false,
      publishBlockedReason: 'Add at least one lesson first',
    });
    const nothing = await as(app, principal)
      .post(`/timetables/${threeA.id}/publish`)
      .expect(409);
    expect(errorCode(nothing)).toBe('NOTHING_TO_PUBLISH');

    // Mon P3: teacher3 is free; `allocate` makes them 3-A's maths teacher.
    const first = data<Cell>(
      await as(app, principal)
        .put(`/timetables/${threeA.id}/slots/1/3`, {
          subjectId: math,
          staffId: teacher3,
          allocate: true,
        })
        .expect(200),
    );
    expect(first).toMatchObject({
      state: 'DRAFT',
      canPublish: true,
      allocated: true,
    });
    const staffList = data<{ id: string; allocatedPeriods: number }[]>(
      await as(app, principal)
        .get(`/branches/${threeA.branchId}/teaching-staff`)
        .expect(200),
    );
    expect(staffList.find((s) => s.id === teacher3)?.allocatedPeriods).toBe(2);

    // Mon P1: teacher3 teaches the published 5-B then.
    const clash = data<Cell>(
      await as(app, principal)
        .put(`/timetables/${threeA.id}/slots/1/1`, {
          subjectId: math,
          staffId: teacher3,
        })
        .expect(200),
    );
    expect(clash.conflicts).toContainEqual(
      expect.objectContaining({
        type: 'TEACHER_DOUBLE_BOOKED',
        severity: 'error',
      }),
    );
    expect(clash.publishBlockedReason).toBe('Fix 1 conflict first');
    await as(app, principal)
      .delete(`/timetables/${threeA.id}/slots/1/1`)
      .expect(200);

    const breakRes = await as(app, principal)
      .put(`/timetables/${threeA.id}/slots/1/5`, {
        subjectId: math,
        staffId: teacher3,
      })
      .expect(400);
    expect(errorCode(breakRes)).toBe('BREAK_PERIOD');

    // Draft vs draft: the coordinator plans teacher3 in 3-B at the same time → warning only.
    const draftClash = data<Cell>(
      await as(app, coordinator)
        .put(`/timetables/${threeB.id}/slots/1/3`, {
          subjectId: math,
          staffId: teacher3,
          allocate: true,
        })
        .expect(200),
    );
    expect(draftClash.conflicts).toContainEqual(
      expect.objectContaining({
        type: 'TEACHER_DRAFT_CLASH',
        severity: 'warning',
      }),
    );
    expect(draftClash.canPublish).toBe(false);
    expect(draftClash.publishBlockedReason).toBe(
      'Ask the principal to publish',
    );
    await as(app, coordinator)
      .post(`/timetables/${threeB.id}/publish`)
      .expect(403);

    // Reloading keeps the autosaved lesson.
    const saved = data<Timetable>(
      await as(app, principal)
        .get(`/timetables?sectionId=${threeA.id}`)
        .expect(200),
    );
    expect(saved).toMatchObject({ state: 'DRAFT', draftSlotCount: 1 });

    // Bell schedule edit that would orphan the lesson → PERIODS_IN_USE.
    const bell = data<{ default: Record<string, unknown>[] }>(
      await as(app, principal)
        .get(`/branches/${threeA.branchId}/bell-schedule`)
        .expect(200),
    );
    const inUse = await as(app, principal)
      .put(`/branches/${threeA.branchId}/bell-schedule`, {
        default: bell.default
          .filter((p) => p.index !== 3)
          .map(({ index, startTime, endTime, isBreak, label }) => ({
            index,
            startTime,
            endTime,
            isBreak,
            ...(label ? { label } : {}),
          })),
      })
      .expect(409);
    expect(errorCode(inUse)).toBe('PERIODS_IN_USE');

    const published = data<Timetable>(
      await as(app, principal)
        .post(`/timetables/${threeA.id}/publish`)
        .expect(200),
    );
    expect(published).toMatchObject({ state: 'PUBLISHED', version: 1 });
    const again = await as(app, principal)
      .post(`/timetables/${threeA.id}/publish`)
      .expect(409);
    expect(errorCode(again)).toBe('NOTHING_TO_PUBLISH');

    // Now 3-B clashes with a published lesson → blocked.
    const blocked = await as(app, principal)
      .post(`/timetables/${threeB.id}/publish`)
      .expect(409);
    expect(errorCode(blocked)).toBe('TIMETABLE_CONFLICTS');

    // Edit → PUBLISHED_WITH_CHANGES, discard → PUBLISHED again.
    const edited = data<Cell>(
      await as(app, principal)
        .put(`/timetables/${threeA.id}/slots/2/3`, {
          subjectId: math,
          staffId: teacher3,
        })
        .expect(200),
    );
    expect(edited.state).toBe('PUBLISHED_WITH_CHANGES');
    const discarded = data<Timetable>(
      await as(app, principal)
        .post(`/timetables/${threeA.id}/discard`)
        .expect(200),
    );
    expect(discarded).toMatchObject({ state: 'PUBLISHED', version: 1 });
    expect(discarded.slots).toHaveLength(1);
  });

  it('teachers edit drafts of their class-teacher section only and never publish', async () => {
    const fiveA = section(5, 'A'); // teacher@ is its class teacher
    const own = data<Timetable>(
      await as(app, teacher)
        .get(`/timetables?sectionId=${fiveA.id}`)
        .expect(200),
    );
    expect(own).toMatchObject({ canEdit: true, canPublish: false });
    // The lesson dialog's teacher list is readable for the class teacher (not editable).
    await as(app, teacher)
      .get(`/branches/${fiveA.branchId}/teaching-staff`)
      .expect(200);
    await as(app, teacher)
      .put(`/sections/${fiveA.id}/class-teacher`, { staffId: null })
      .expect(403);

    const cell = data<Cell>(
      await as(app, teacher)
        .put(`/timetables/${fiveA.id}/slots/1/1`, {
          subjectId: subjects.get('MATH'),
          staffId: await staffId('teacher@eschool.local'),
          roomId: null,
        })
        .expect(200),
    );
    expect(cell.state).toBe('PUBLISHED_WITH_CHANGES');
    expect(cell.publishBlockedReason).toBe('Ask the principal to publish');

    const other = await as(app, teacher)
      .put(`/timetables/${section(5, 'B').id}/slots/1/1`, {
        subjectId: subjects.get('MATH'),
        staffId: await staffId('teacher@eschool.local'),
      })
      .expect(403);
    expect(errorCode(other)).toBe('FORBIDDEN_SCOPE');
    await as(app, teacher).post(`/timetables/${fiveA.id}/publish`).expect(403);
    await as(app, teacher).post(`/timetables/${fiveA.id}/discard`).expect(403);

    // The principal throws the teacher's change away; teachers keep seeing the published week.
    await as(app, principal)
      .post(`/timetables/${fiveA.id}/discard`)
      .expect(200);
  });
});
