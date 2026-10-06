import { Injectable } from '@nestjs/common';
import { formatDate } from '../../core/common/dates';
import { invalid, notFound } from '../../core/common/errors/errors';
import { isoWeekday } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';

/** Branch working days minus holidays/vacations from the calendar. */
@Injectable()
export class WorkingDayService {
  constructor(private readonly prisma: PrismaService) {}

  async isWorkingDay(branchId: string, date: Date): Promise<boolean> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { schoolId: true, workingDays: true },
    });
    if (!branch) throw notFound('Branch');
    if (!branch.workingDays.includes(isoWeekday(date))) return false;
    const holidays = await this.prisma.calendarEvent.count({
      where: {
        schoolId: branch.schoolId,
        OR: [{ branchId }, { branchId: null }],
        type: { in: ['HOLIDAY', 'VACATION'] },
        status: 'ACTIVE',
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
    return holidays === 0;
  }

  async assertWorkingDay(branchId: string, date: Date): Promise<void> {
    if (!(await this.isWorkingDay(branchId, date))) {
      throw invalid(`${formatDate(date)} is not a working day`, {
        reason: 'NON_WORKING_DAY',
      });
    }
  }

  /** Working days in `[from, to]` (two queries, any range length). */
  async between(branchId: string, from: Date, to: Date): Promise<Date[]> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { schoolId: true, workingDays: true },
    });
    if (!branch) throw notFound('Branch');
    const holidays = await this.prisma.calendarEvent.findMany({
      where: {
        schoolId: branch.schoolId,
        OR: [{ branchId }, { branchId: null }],
        type: { in: ['HOLIDAY', 'VACATION'] },
        status: 'ACTIVE',
        startDate: { lte: to },
        endDate: { gte: from },
      },
      select: { startDate: true, endDate: true },
    });
    const days: Date[] = [];
    for (let t = from.getTime(); t <= to.getTime(); t += 86_400_000) {
      const date = new Date(t);
      const off =
        !branch.workingDays.includes(isoWeekday(date)) ||
        holidays.some((h) => h.startDate <= date && h.endDate >= date);
      if (!off) days.push(date);
    }
    return days;
  }

  /** The last `count` working days up to and including `until`, newest first. */
  async recentWorkingDays(
    branchId: string,
    until: Date,
    count: number,
  ): Promise<Date[]> {
    const days: Date[] = [];
    for (let i = 0; days.length < count && i < count * 3; i++) {
      const date = new Date(until.getTime() - i * 86_400_000);
      if (await this.isWorkingDay(branchId, date)) days.push(date);
    }
    return days;
  }
}
