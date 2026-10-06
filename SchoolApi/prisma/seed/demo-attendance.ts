import type { AttendanceStatus } from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { type DailyContext, userId } from './demo-daily-context';

function statusFor(student: number, day: number): AttendanceStatus {
  const roll = (student * 7 + day * 3) % 17;
  if (roll === 0) return 'ABSENT';
  if (roll === 1) return 'LATE';
  if (roll === 2) return 'HALF_DAY';
  if (roll === 3 && day % 4 === 0) return 'LEAVE';
  return 'PRESENT';
}

/** 5-A: today SUBMITTED, the previous 10 school days LOCKED; 5-B today stays UNMARKED. */
export async function seedAttendance(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  const sectionId = ctx.org.sections.get('5-A')!;
  const teacher = userId(ctx, 'teacher@eschool.local');
  const students = ctx.students.get('5-A') ?? [];
  for (const [d, date] of ctx.days.entries()) {
    const exists = await prisma.attendanceRegister.findUnique({
      where: { sectionId_date: { sectionId, date } },
    });
    if (exists) continue;
    const isToday = date.getTime() === ctx.today.getTime();
    await prisma.attendanceRegister.create({
      data: {
        schoolId: ctx.org.schoolId,
        branchId: ctx.org.branchId,
        sessionId: ctx.org.sessionId,
        sectionId,
        date,
        status: isToday ? 'SUBMITTED' : 'LOCKED',
        version: 2,
        submittedById: teacher,
        submittedAt: new Date(date.getTime() + 4 * 3600_000),
        lockedAt: isToday ? null : new Date(date.getTime() + 6 * 3600_000),
        createdById: teacher,
        entries: {
          create: students.map((s, i) => ({
            studentId: s.id,
            status: statusFor(i, d),
            guardianNotifiedAt: new Date(),
          })),
        },
      },
    });
  }
  await prisma.staffAttendance.createMany({
    data: [...ctx.staff.entries()].map(([email, staffId]) => ({
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      staffId,
      date: ctx.days[0],
      status: email === 'teacher3@eschool.local' ? 'ABSENT' : 'PRESENT',
      checkIn: email === 'teacher3@eschool.local' ? null : '07:50',
    })),
    skipDuplicates: true,
  });
}
