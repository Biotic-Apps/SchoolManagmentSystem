import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { listRoutes, type RouteInfo } from './support/route-inventory';
import { as, createTestApp, errorCode, login } from './support/test-app';

/**
 * security.md §2.5 / §4: a guardian asking about a student who is not their
 * verified child gets 404 (no existence leak) on every student-keyed GET.
 * The table is checked against the live route list, so a new student-keyed
 * endpoint fails this suite until it is added here.
 */
interface Probe {
  /** Request path for a student id (no /api/v1 prefix). */
  url: (studentId: string) => string;
  /**
   * Status for the parent's own child (default 200). 403 = the PARENT role
   * cannot use the endpoint at all; the other student must then get the
   * identical response (nothing student-specific is revealed).
   */
  own?: number;
}

let staffId = '';

const q = (path: string) => (id: string) => `${path}?studentId=${id}`;
const p = (suffix: string) => (id: string) => `/students/${id}${suffix}`;

const PROBES: Record<string, Probe> = {
  'GET /students/:id': { url: p('') },
  'GET /students/:id/enrollments': { url: p('/enrollments') },
  'GET /students/:id/fee-summary': { url: p('/fee-summary') },
  'GET /students/:id/health': { url: p('/health') },
  'GET /students/:id/homework-completion': {
    url: p('/homework-completion'),
  },
  'GET /students/:id/id-card': { url: p('/id-card') },
  'GET /students/:id/ledger': { url: p('/ledger') },
  'GET /students/:id/pickup-persons': { url: p('/pickup-persons') },
  'GET /students/:id/progress-notes': { url: p('/progress-notes') },
  'GET /students/:id/report-cards': { url: p('/report-cards') },
  'GET /students/:id/results': { url: p('/results') },
  'GET /attendance/students/:id': {
    url: (id) => `/attendance/students/${id}`,
  },
  'GET /activities/mine': { url: q('/activities/mine') },
  'GET /certificates': { url: q('/certificates') },
  'GET /concessions': { url: q('/concessions') },
  'GET /dashboard/child-today': { url: q('/dashboard/child-today') },
  'GET /documents': {
    url: (id) => `/documents?ownerType=STUDENT&ownerId=${id}`,
  },
  'GET /health/incidents': { url: q('/health/incidents') },
  // Parents hold no inventory.view.
  'GET /inventory/movements': { url: q('/inventory/movements'), own: 403 },
  'GET /invoices': { url: q('/invoices') },
  'GET /meetings': { url: q('/meetings') },
  'GET /messages/recipients': { url: q('/messages/recipients') },
  'GET /messages/threads': { url: q('/messages/threads') },
  'GET /payment-proofs': { url: q('/payment-proofs') },
  'GET /payments': { url: q('/payments') },
  // Refund lists are staff-only (parents see refunds on the ledger).
  'GET /refunds': { url: q('/refunds'), own: 403 },
  'GET /timetables/me': { url: q('/timetables/me') },
  // Shares WeekQueryDto: studentId is ignored and parents cannot read
  // teacher timetables (FORBIDDEN_SCOPE whatever the student).
  'GET /timetables/teacher/:staffId': {
    url: (id) => `/timetables/teacher/${staffId}?studentId=${id}`,
    own: 403,
  },
};

/** GET routes keyed by a student: `/students/:id…` or a studentId/ownerId query. */
const isStudentKeyed = (route: RouteInfo) =>
  route.method === 'GET' &&
  (route.path.includes('/students/:') ||
    route.queryFields.includes('studentId') ||
    route.queryFields.includes('ownerId'));

describe('Security: parent isolation sweep (e2e)', () => {
  let app: INestApplication<App>;
  let parent: string;
  let ownChild: string;
  let otherStudent: string;

  beforeAll(async () => {
    app = await createTestApp();
    parent = (await login(app, 'parent@eschool.local')).accessToken;
    const principal = (await login(app, 'principal@eschool.local')).accessToken;
    const me = await as(app, parent).get('/me').expect(200);
    const children = (me.body as { data: { children: { id: string }[] } }).data
      .children;
    expect(children.length).toBeGreaterThanOrEqual(2);
    ownChild = children[0].id;
    const linked = new Set(children.map((c) => c.id));
    const list = await as(app, principal)
      .get('/students?pageSize=100')
      .expect(200);
    otherStudent = (list.body as { data: { id: string }[] }).data
      .map((s) => s.id)
      .find((id) => !linked.has(id)) as string;
    expect(otherStudent).toBeDefined();
    const staff = await as(app, principal).get('/staff?pageSize=1').expect(200);
    staffId = (staff.body as { data: { id: string }[] }).data[0].id;
    // The ID card read 404s until a card exists; request one (inline job).
    await as(app, principal).post(`/students/${ownChild}/id-card`).expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('covers every student-keyed GET route', () => {
    const discovered = listRoutes(app)
      .filter(isStudentKeyed)
      .map((r) => r.key);
    expect(discovered.filter((key) => !(key in PROBES))).toEqual([]);
    expect(
      Object.keys(PROBES).filter((key) => !discovered.includes(key)),
    ).toEqual([]);
  });

  it.each(Object.entries(PROBES))('%s', async (_key, probe) => {
    const own = await as(app, parent).get(probe.url(ownChild));
    const other = await as(app, parent).get(probe.url(otherStudent));
    expect(own.status).toBe(probe.own ?? 200);
    if (probe.own === 403) {
      expect(other.status).toBe(403);
      expect(errorCode(other)).toBe(errorCode(own));
      return;
    }
    expect(other.status).toBe(404);
    expect(errorCode(other)).toBe('NOT_FOUND');
  });
});
