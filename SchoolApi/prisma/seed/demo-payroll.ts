import { Prisma } from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { type DailyContext, userId } from './demo-daily-context';
import { addMonths, day, iso } from './demo-finance-helpers';

const BASIC: Record<string, number> = {
  TEACHER: 6_000_000,
  COORDINATOR: 8_000_000,
  ACCOUNTANT: 7_000_000,
  HELPER: 3_000_000,
};

const pct = (amount: number, percent: number) =>
  Math.floor((amount * percent * 2 + 100) / 200);

function components(basic: number) {
  const allowances = [
    { name: 'House rent', amountMinor: pct(basic, 10) },
    { name: 'Conveyance', amountMinor: 500_000 },
  ];
  const deductions = [{ name: 'Provident fund', amountMinor: pct(basic, 5) }];
  return { allowances, deductions };
}

/** Mon–Sat in the month (seed approximation of the branch calendar). */
function workingDays(period: string): number {
  const [y, m] = period.split('-').map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  let count = 0;
  for (let d = 1; d <= days; d++)
    if (new Date(Date.UTC(y, m - 1, d)).getUTCDay() !== 0) count++;
  return count;
}

async function seedStructures(prisma: SeedClient, ctx: DailyContext) {
  const staff = await prisma.staff.findMany({
    where: { branchId: ctx.org.branchId, status: 'ACTIVE' },
  });
  const accountant = userId(ctx, 'accountant@eschool.local');
  for (const member of staff) {
    if (
      await prisma.salaryStructure.findFirst({ where: { staffId: member.id } })
    )
      continue;
    const basic = BASIC[member.designation] ?? BASIC.TEACHER;
    const { allowances, deductions } = components(basic);
    await prisma.salaryStructure.create({
      data: {
        schoolId: member.schoolId,
        branchId: member.branchId,
        staffId: member.id,
        effectiveFrom: '2026-04',
        basicMinor: BigInt(basic),
        allowances,
        deductions,
        reason: 'Initial salary for session 2026-27',
        createdById: accountant,
      },
    });
  }
  return staff;
}

async function seedRun(
  prisma: SeedClient,
  ctx: DailyContext,
  staff: Awaited<ReturnType<typeof seedStructures>>,
  month: string,
  paid: boolean,
) {
  if (
    await prisma.payrollRun.findUnique({
      where: { branchId_month: { branchId: ctx.org.branchId, month } },
    })
  )
    return;
  const accountant = userId(ctx, 'accountant@eschool.local');
  const principal = userId(ctx, 'principal@eschool.local');
  const now = new Date();
  const run = await prisma.payrollRun.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      month,
      status: paid ? 'PAID' : 'CALCULATED',
      calculatedAt: now,
      calculatedById: accountant,
      reviewedById: paid ? accountant : null,
      reviewedAt: paid ? now : null,
      approvedById: paid ? principal : null,
      approvedAt: paid ? now : null,
      createdById: accountant,
    },
  });
  const days = workingDays(month);
  for (const member of staff) {
    const structure = await prisma.salaryStructure.findFirst({
      where: { staffId: member.id },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (!structure) continue;
    const allowances = structure.allowances as {
      name: string;
      amountMinor: number;
    }[];
    const deductions = structure.deductions as {
      name: string;
      amountMinor: number;
    }[];
    const allowancesMinor = allowances.reduce((s, a) => s + a.amountMinor, 0);
    const deductionsMinor = deductions.reduce((s, d) => s + d.amountMinor, 0);
    const basic = Number(structure.basicMinor);
    const net = BigInt(basic + allowancesMinor - deductionsMinor);
    const line = await prisma.payrollLine.create({
      data: {
        runId: run.id,
        staffId: member.id,
        designation: member.designation,
        structureId: structure.id,
        basicMinor: structure.basicMinor,
        allowancesMinor: BigInt(allowancesMinor),
        deductionsMinor: BigInt(deductionsMinor),
        workingDays: days,
        unpaidLeaveDays: new Prisma.Decimal(0),
        leaveDeductionMinor: 0n,
        adjustmentsMinor: 0n,
        netMinor: net,
        paidMinor: paid ? net : 0n,
        status: paid ? 'PAID' : 'UNPAID',
        detail: {
          allowances,
          deductions,
          adjustments: [],
          unpaidHalfDays: 0,
          grossMinor: basic + allowancesMinor,
        },
      },
    });
    if (paid) {
      await prisma.payrollPayment.create({
        data: {
          runId: run.id,
          lineId: line.id,
          staffId: member.id,
          amountMinor: net,
          method: 'BANK',
          reference: `SAL-${month}-${member.employeeNo ?? member.id.slice(0, 6)}`,
          paidOn: day(`${addMonths(month, 1)}-01`),
          paidById: accountant,
        },
      });
    }
  }
}

/** Phase 4 §J payroll: structures for all staff, last month PAID, current month CALCULATED. */
export async function seedPayroll(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  const staff = await seedStructures(prisma, ctx);
  const current = iso(ctx.today).slice(0, 7);
  await seedRun(prisma, ctx, staff, addMonths(current, -1), true);
  await seedRun(prisma, ctx, staff, current, false);
}
