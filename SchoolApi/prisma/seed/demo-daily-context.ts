import type { SeedClient } from './client';
import type { DemoOrg } from './demo-people';

const DAY = 86_400_000;

export interface DailyContext {
  org: DemoOrg;
  today: Date;
  /** Recent working days, newest first (today first when it is one). */
  days: Date[];
  users: Map<string, string>;
  staff: Map<string, string>;
  /** `5-A` → active students ordered by roll number. */
  students: Map<string, { id: string; name: string }[]>;
}

export function utcToday(): Date {
  return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY);

async function workingDays(prisma: SeedClient, org: DemoOrg, until: Date, count: number): Promise<Date[]> {
  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: org.branchId } });
  const holidays = await prisma.calendarEvent.findMany({
    where: { schoolId: org.schoolId, type: { in: ['HOLIDAY', 'VACATION'] }, status: 'ACTIVE' },
  });
  const days: Date[] = [];
  for (let i = 0; days.length < count && i < count * 3; i++) {
    const date = addDays(until, -i);
    const weekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
    const off =
      !branch.workingDays.includes(weekday) ||
      holidays.some((h) => (h.branchId === null || h.branchId === org.branchId) && h.startDate <= date && h.endDate >= date);
    if (!off) days.push(date);
  }
  return days;
}

export async function loadDailyContext(prisma: SeedClient, org: DemoOrg): Promise<DailyContext> {
  const today = utcToday();
  const users = new Map(
    (await prisma.user.findMany({ where: { email: { endsWith: '@eschool.local' } } })).map((u) => [u.email!, u.id]),
  );
  const staff = new Map(
    (await prisma.staff.findMany({ where: { branchId: org.branchId }, include: { user: true } }))
      .filter((s) => s.user?.email)
      .map((s) => [s.user!.email!, s.id]),
  );
  const students = new Map<string, { id: string; name: string }[]>();
  for (const [key, sectionId] of org.sections) {
    const rows = await prisma.enrollment.findMany({
      where: { sectionId, status: 'ACTIVE' },
      orderBy: { rollNo: 'asc' },
      include: { student: true },
    });
    students.set(
      key,
      rows.map((r) => ({ id: r.studentId, name: `${r.student.firstName} ${r.student.lastName}` })),
    );
  }
  return { org, today, days: await workingDays(prisma, org, today, 11), users, staff, students };
}

export const userId = (ctx: DailyContext, email: string) => {
  const id = ctx.users.get(email);
  if (!id) throw new Error(`Seed user ${email} missing`);
  return id;
};
