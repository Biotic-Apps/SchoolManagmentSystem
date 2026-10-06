import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { as, createTestApp, errorCode, login } from './support/test-app';

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
});
