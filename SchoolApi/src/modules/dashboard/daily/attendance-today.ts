import type { Prisma } from '../../../generated/prisma/client';
import { today } from '../../../core/common/week';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { AttendanceTodayDto } from '../dto/daily-dashboard.dto';

/** Today's finalised entries in scope; students without one are unmarked. */
export async function attendanceToday(
  prisma: PrismaService,
  scope: Scope,
  branchId?: string,
): Promise<AttendanceTodayDto> {
  const day = today();
  const enrollment: Prisma.EnrollmentWhereInput = scope.guardian
    ? { studentId: { in: [...scope.studentIds] } }
    : scope.sectionLimited
      ? { sectionId: { in: [...scope.sectionIds] } }
      : scope.sectionFilter();
  const where: Prisma.EnrollmentWhereInput = {
    AND: [enrollment, { status: 'ACTIVE', branchId }],
  };
  const [students, entries] = await Promise.all([
    prisma.enrollment.findMany({ where, select: { studentId: true } }),
    prisma.attendanceEntry.groupBy({
      by: ['status'],
      where: {
        student: { enrollments: { some: where } },
        register: { date: day, status: { in: ['SUBMITTED', 'LOCKED'] } },
      },
      _count: { _all: true },
    }),
  ]);
  const count = (status: string) =>
    entries.find((e) => e.status === status)?._count._all ?? 0;
  const marked = entries.reduce((sum, e) => sum + e._count._all, 0);
  return {
    present: count('PRESENT') + count('HALF_DAY'),
    absent: count('ABSENT'),
    late: count('LATE'),
    unmarked: Math.max(0, students.length - marked),
  };
}
