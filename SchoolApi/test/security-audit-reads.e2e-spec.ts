import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { as, createTestApp, login } from './support/test-app';

/** security.md §5/§9: medical and pay reads are written to the audit log. */
describe('Security: audited reads (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let principal: string;
  let accountant: string;
  let teacher: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    principal = (await login(app, 'principal@eschool.local')).accessToken;
    accountant = (await login(app, 'accountant@eschool.local')).accessToken;
    teacher = (await login(app, 'teacher@eschool.local')).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const count = (action: string, entityId?: string) =>
    prisma.auditLog.count({ where: { action, entityId } });

  it('logs a student health profile read (health.read)', async () => {
    const list = await as(app, principal).get('/students?pageSize=1');
    const id = (list.body as { data: { id: string }[] }).data[0].id;
    const before = await count('health.read');
    await as(app, principal).get(`/students/${id}/health`).expect(200);
    expect(await count('health.read')).toBe(before + 1);
  });

  it('logs another staff member salary structure read', async () => {
    const staff = await prisma.staff.findFirstOrThrow({
      where: { user: { email: 'teacher2@eschool.local' } },
    });
    const before = await count('payroll.salary_structure_read', staff.id);
    const res = await as(app, accountant).get(
      `/staff/${staff.id}/salary-structure`,
    );
    expect(res.status).toBe(200);
    expect(await count('payroll.salary_structure_read', staff.id)).toBe(
      before + 1,
    );
  });

  it('teacher cannot read another staff salary structure or payslip', async () => {
    const staff = await prisma.staff.findFirstOrThrow({
      where: { user: { email: 'teacher2@eschool.local' } },
    });
    await as(app, teacher)
      .get(`/staff/${staff.id}/salary-structure`)
      .expect(403);
    await as(app, teacher).get(`/payslips/${staff.id}`).expect(403);
  });

  it('logs a payslip read of another staff member (payroll.payslip_read)', async () => {
    const staff = await prisma.staff.findFirstOrThrow({
      where: { user: { email: 'teacher2@eschool.local' } },
    });
    const last = new Date();
    last.setUTCDate(1);
    last.setUTCMonth(last.getUTCMonth() - 1);
    const month = last.toISOString().slice(0, 7);
    const before = await count('payroll.payslip_read');
    await as(app, accountant)
      .get(`/payslips/${staff.id}?month=${month}`)
      .expect(200);
    expect(await count('payroll.payslip_read')).toBe(before + 1);
  });
});
