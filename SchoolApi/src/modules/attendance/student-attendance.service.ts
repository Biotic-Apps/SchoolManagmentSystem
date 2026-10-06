import { Injectable } from '@nestjs/common';
import { formatDate, parseDate } from '../../core/common/dates';
import { invalid } from '../../core/common/errors/errors';
import { today } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { StudentPlacementService } from '../school-day/student-placement.service';
import { WorkingDayService } from '../school-day/working-day.service';
import { tally } from './attendance-tally';
import type { StudentAttendanceQueryDto } from './dto/register-input.dto';
import type { StudentAttendanceDto } from './dto/register.dto';

const MAX_DAYS = 366;

/** A student's days: finalised entries; working days without one are unmarked. */
@Injectable()
export class StudentAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placement: StudentPlacementService,
    private readonly workingDays: WorkingDayService,
  ) {}

  async history(
    scope: Scope,
    studentId: string,
    query: StudentAttendanceQueryDto,
  ): Promise<StudentAttendanceDto> {
    const student = await this.placement.read(scope, studentId);
    const session = await this.prisma.academicSession.findUniqueOrThrow({
      where: { id: student.sessionId },
    });
    const to = query.to ? parseDate(query.to) : today();
    const from = query.from
      ? parseDate(query.from)
      : new Date(
          Math.max(session.startDate.getTime(), to.getTime() - 30 * 86_400_000),
        );
    if (to < from) throw invalid('to must be on or after from');
    if ((to.getTime() - from.getTime()) / 86_400_000 > MAX_DAYS)
      throw invalid(`Range is limited to ${MAX_DAYS} days`);

    const [days, entries] = await Promise.all([
      this.workingDays.between(student.branchId, from, to),
      this.prisma.attendanceEntry.findMany({
        where: {
          studentId,
          register: {
            date: { gte: from, lte: to },
            status: { in: ['SUBMITTED', 'LOCKED'] },
          },
        },
        include: { register: { select: { date: true } } },
      }),
    ]);
    const byDate = new Map(
      entries.map((e) => [formatDate(e.register.date), e]),
    );
    const rows = days.map((day) => {
      const entry = byDate.get(formatDate(day));
      return {
        date: formatDate(day),
        status: entry?.status ?? null,
        remark: entry?.remark ?? null,
      };
    });
    return { entries: rows, summary: tally(rows.map((r) => r.status)) };
  }
}
