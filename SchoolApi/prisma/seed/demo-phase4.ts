import type { SeedClient } from './client';
import {
  addDays,
  type DailyContext,
  loadDailyContext,
  userId,
} from './demo-daily-context';
import { seedFees } from './demo-fees';
import { seedPayroll } from './demo-payroll';
import type { DemoOrg } from './demo-people';
import { bumpSequence } from './demo-people';
import { seedProcurement } from './demo-procurement';
import { seedResults } from './demo-results';

/** One CHARACTER certificate ISSUED; one SCHOOL_LEAVING REQUESTED for a student with dues. */
async function seedCertificates(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  if (
    await prisma.certificate.findFirst({
      where: { branchId: ctx.org.branchId },
    })
  )
    return;
  const principal = userId(ctx, 'principal@eschool.local');
  const year = ctx.today.getUTCFullYear();
  const base = { schoolId: ctx.org.schoolId, branchId: ctx.org.branchId };
  await prisma.certificate.create({
    data: {
      ...base,
      studentId: ctx.students.get('5-B')![0].id,
      type: 'CHARACTER',
      purpose: 'Scholarship application',
      status: 'ISSUED',
      serialNo: `CERT-CHARACTER-${year}-0001`,
      issuedOn: addDays(ctx.today, -4),
      requestedById: userId(ctx, 'accountant@eschool.local'),
      decidedById: principal,
      decidedAt: addDays(ctx.today, -5),
      issuedById: principal,
    },
  });
  await bumpSequence(prisma, `cert:${ctx.org.schoolId}:CHARACTER:${year}`, 2);
  // 4-A #1 has an unpaid overdue invoice (demo-fees scenario) → clearance blocks approval.
  await prisma.certificate.create({
    data: {
      ...base,
      studentId: ctx.students.get('4-A')![1].id,
      type: 'SCHOOL_LEAVING',
      purpose: 'Family relocating to Karachi',
      status: 'REQUESTED',
      requestedById: userId(ctx, 'accountant@eschool.local'),
    },
  });
}

/** Phase 4 §J demo data (finance and results); every step is idempotent. */
export async function seedFinanceAndResults(
  prisma: SeedClient,
  org: DemoOrg,
): Promise<void> {
  const ctx = await loadDailyContext(prisma, org);
  await seedResults(prisma, ctx);
  await seedFees(prisma, ctx);
  await seedPayroll(prisma, ctx);
  await seedProcurement(prisma, ctx);
  await seedCertificates(prisma, ctx);
}
