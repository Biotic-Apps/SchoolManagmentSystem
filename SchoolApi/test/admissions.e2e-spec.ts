import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { OtpService } from '../src/core/otp/otp.service';
import {
  as,
  createTestApp,
  DEMO_PASSWORD,
  login,
  unique,
} from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

describe('Admissions and child links (e2e)', () => {
  let app: INestApplication<App>;
  let principal: string;
  let admin: string;
  let branchId: string;
  let sessionId: string;
  let classId: string;
  let sectionId: string;

  beforeAll(async () => {
    app = await createTestApp();
    principal = (await login(app, 'principal@eschool.local')).accessToken;
    admin = (await login(app, 'admin@eschool.local')).accessToken;
    const sections = data<
      {
        id: string;
        branchId: string;
        sessionId: string;
        classId: string;
        className: string;
        name: string;
      }[]
    >(await as(app, principal).get('/sections?pageSize=100').expect(200));
    const target = sections.find(
      (s) => s.className === 'Class 2' && s.name === 'A',
    )!;
    ({ branchId, sessionId, classId } = target);
    sectionId = target.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('enquiry → application → offer → confirm creates the student; a parent then links via OTP', async () => {
    const guardianPhone = '+92333' + Date.now().toString().slice(-7);
    const enquiry = data<{ id: string }>(
      await as(app, principal)
        .post('/admissions/enquiries', {
          branchId,
          sessionId,
          classId,
          childName: 'Zara Iqbal',
          dob: '2019-03-15',
          guardianName: 'Iqbal Ahmed',
          phone: guardianPhone,
        })
        .expect(201),
    );
    const application = data<{
      id: string;
      applicationNo: string;
      status: string;
    }>(
      await as(app, principal)
        .post(`/admissions/enquiries/${enquiry.id}/convert`, {
          gender: 'FEMALE',
        })
        .expect(201),
    );
    expect(application.status).toBe('SUBMITTED');
    expect(application.applicationNo).toMatch(/^APP-\d{4}-\d{4}$/);

    await as(app, principal)
      .post(`/admissions/applications/${application.id}/test`, {
        scheduledAt: '2026-10-20T05:00:00Z',
        venue: 'Hall',
      })
      .expect(200);
    await as(app, principal)
      .post(`/admissions/applications/${application.id}/test-result`, {
        score: 40,
        maxScore: 50,
      })
      .expect(200);
    const offered = data<{ status: string }>(
      await as(app, principal)
        .post(`/admissions/applications/${application.id}/decide`, {
          decision: 'OFFER',
        })
        .expect(200),
    );
    expect(offered.status).toBe('OFFERED');

    const confirmed = data<{
      application: { status: string; studentId: string };
      studentId: string;
    }>(
      await as(app, principal)
        .post(`/admissions/applications/${application.id}/confirm`, {
          admissionFee: { status: 'PAID', amountMinor: 500000 },
          sectionId,
          admissionDate: '2026-10-06',
        })
        .expect(200),
    );
    expect(confirmed.application.status).toBe('ENROLLED');
    const student = data<{
      admissionNo: string;
      dob: string;
      guardians: { status: string; isPrimary: boolean }[];
    }>(
      await as(app, principal)
        .get(`/students/${confirmed.studentId}`)
        .expect(200),
    );
    expect(student.admissionNo).toMatch(/^BRIGHT-2026-\d{4}$/);
    expect(student.guardians).toEqual([
      expect.objectContaining({ status: 'VERIFIED', isPrimary: true }),
    ]);

    // A parent account requests the link with admission no + DOB + OTP.
    const parentEmail = `${unique('parent').toLowerCase()}@eschool.local`;
    await as(app, admin)
      .post('/users', {
        name: 'Iqbal Ahmed',
        email: parentEmail,
        phone: '+92334' + Date.now().toString().slice(-7),
        password: DEMO_PASSWORD,
        assignments: [
          {
            roleKey: 'PARENT',
            scopeType: 'GUARDIAN',
            schoolId: await schoolId(),
          },
        ],
      })
      .expect(201);
    let parent = (await login(app, parentEmail)).accessToken;
    await as(app, parent)
      .post('/auth/password/change', {
        currentPassword: DEMO_PASSWORD,
        newPassword: 'Parent@2468',
      })
      .expect(200);
    parent = (await login(app, parentEmail, 'Parent@2468')).accessToken;

    jest.spyOn(app.get(OtpService), 'generateCode').mockReturnValue('123456');
    const started = data<{ requestId: string; maskedPhone: string }>(
      await as(app, parent)
        .post('/child-links/request', {
          admissionNo: student.admissionNo,
          dob: student.dob,
          relation: 'FATHER',
        })
        .expect(200),
    );
    expect(started.maskedPhone).toContain('*');
    await as(app, parent)
      .post(`/child-links/${started.requestId}/otp`, { code: '000000' })
      .expect(400);
    const requested = data<{ status: string }>(
      await as(app, parent)
        .post(`/child-links/${started.requestId}/otp`, { code: '123456' })
        .expect(200),
    );
    expect(requested.status).toBe('REQUESTED');
    await as(app, parent).get(`/students/${confirmed.studentId}`).expect(404);

    const pending = data<{ id: string }[]>(
      await as(app, principal).get('/child-links?status=REQUESTED').expect(200),
    );
    expect(pending.map((r) => r.id)).toContain(started.requestId);
    const approved = data<{ status: string }>(
      await as(app, principal)
        .post(`/child-links/${started.requestId}/approve`, {})
        .expect(200),
    );
    expect(approved.status).toBe('VERIFIED');

    await as(app, parent).get(`/students/${confirmed.studentId}`).expect(200);
    const me = data<{ children: { id: string }[] }>(
      await as(app, parent).get('/me').expect(200),
    );
    expect(me.children.map((c) => c.id)).toEqual([confirmed.studentId]);
  });

  it('waitlisted applications are ordered and can be offered', async () => {
    const list = data<{ id: string; waitlistPosition: number }[]>(
      await as(app, principal).get('/admissions/waiting-list').expect(200),
    );
    expect(list.length).toBeGreaterThanOrEqual(2);
    const positions = list.map((a) => a.waitlistPosition);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    const offered = data<{ status: string }>(
      await as(app, principal)
        .post(`/admissions/waiting-list/${list[0].id}/offer`)
        .expect(200),
    );
    expect(offered.status).toBe('OFFERED');
  });

  async function schoolId(): Promise<string> {
    const schools = data<{ id: string }[]>(
      await as(app, principal).get('/schools').expect(200),
    );
    return schools[0].id;
  }
});
