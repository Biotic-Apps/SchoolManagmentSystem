import { Injectable } from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { tally } from '../../attendance/attendance-tally';
import type {
  HomeworkDueDto,
  LatestResultDto,
  ParentHomeAttendanceDto,
} from './parent-home.dto';

/** Attendance, homework and result figures for the parent home KPI tiles. */
@Injectable()
export class ParentHomeStatsReader {
  constructor(private readonly prisma: PrismaService) {}

  /** Today's mark and this month's tally (submitted registers only). */
  async attendance(
    studentId: string,
    day: Date,
  ): Promise<ParentHomeAttendanceDto> {
    const first = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1),
    );
    const rows = await this.prisma.attendanceEntry.findMany({
      where: {
        studentId,
        register: {
          date: { gte: first, lte: day },
          status: { in: ['SUBMITTED', 'LOCKED'] },
        },
      },
      select: { status: true, register: { select: { date: true } } },
    });
    const todayKey = formatDate(day);
    const todays = rows.find((r) => formatDate(r.register.date) === todayKey);
    const t = tally(rows.map((r) => r.status));
    return {
      today: todays?.status ?? 'UNMARKED',
      month: {
        month: todayKey.slice(0, 7),
        present: t.present,
        absent: t.absent,
        late: t.late,
        leave: t.leave,
        halfDay: t.halfDay,
        percent: t.percent,
      },
    };
  }

  /** Published homework of the section still due (today or later). */
  async homework(sectionId: string, day: Date): Promise<HomeworkDueDto> {
    const where = {
      sectionId,
      status: 'PUBLISHED' as const,
      homework: { not: null },
      dueDate: { gte: day },
    };
    const [dueCount, next] = await Promise.all([
      this.prisma.diaryEntry.count({ where }),
      this.prisma.diaryEntry.findFirst({
        where,
        orderBy: { dueDate: 'asc' },
        select: { dueDate: true },
      }),
    ]);
    return {
      dueCount,
      nextDueDate: next?.dueDate ? formatDate(next.dueDate) : null,
    };
  }

  /** The most recently published exam result of the child. */
  async latestResult(studentId: string): Promise<LatestResultDto | null> {
    const row = await this.prisma.examResult.findFirst({
      where: { studentId, exam: { status: 'PUBLISHED' } },
      orderBy: { exam: { publishedAt: 'desc' } },
      select: {
        examId: true,
        percent: true,
        grade: true,
        position: true,
        passed: true,
        exam: { select: { name: true, publishedAt: true } },
      },
    });
    if (!row) return null;
    return {
      examId: row.examId,
      examName: row.exam.name,
      percent: Number(row.percent),
      grade: row.grade,
      position: row.position,
      passed: row.passed,
      publishedAt: row.exam.publishedAt?.toISOString() ?? null,
    };
  }
}
