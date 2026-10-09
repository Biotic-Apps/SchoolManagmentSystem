import { Injectable } from '@nestjs/common';
import { formatDate, parseDate } from '../../../core/common/dates';
import { notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { periodEnd, periodStart } from '../../finance-core/period';
import { overtimeMinutes } from '../calculation/overtime-pay';
import { PayrollSettingsService } from '../settings/payroll-settings.service';
import { staffTimings } from '../settings/staff-timings';
import type { OvertimeSyncResultDto } from './dto/overtime.dto';

/**
 * Finds overtime in staff attendance: a check-out later than the branch
 * staff leave time (plus the grace minutes) becomes a PENDING entry.
 * Decided entries are never touched; pending ones follow the attendance.
 */
@Injectable()
export class OvertimeSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: PayrollSettingsService,
  ) {}

  async sync(branchId: string, month: string): Promise<OvertimeSyncResultDto> {
    const result = { created: 0, updated: 0, removed: 0 };
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { schoolId: true, timings: true },
    });
    if (!branch) throw notFound('Branch');
    const rules = await this.settings.rules(branch.schoolId);
    const times = staffTimings(branch.timings);
    const found = new Map<string, number>();
    if (rules.overtimeEnabled && times) {
      const marks = await this.prisma.staffAttendance.findMany({
        where: {
          branchId,
          date: { gte: periodStart(month), lte: periodEnd(month) },
          checkOut: { not: null },
        },
        select: { staffId: true, date: true, checkOut: true },
      });
      for (const mark of marks) {
        const minutes = overtimeMinutes(
          mark.checkOut,
          times.leavesAt,
          rules.overtimeGraceMinutes,
        );
        if (minutes > 0) {
          found.set(`${mark.staffId}|${formatDate(mark.date)}`, minutes);
        }
      }
    }
    const existing = await this.prisma.payrollOvertime.findMany({
      where: { branchId, month, source: 'ATTENDANCE' },
    });
    const known = new Set<string>();
    for (const row of existing) {
      const key = `${row.staffId}|${formatDate(row.date)}`;
      known.add(key);
      if (row.status !== 'PENDING') continue;
      const minutes = found.get(key);
      if (minutes === undefined) {
        await this.prisma.payrollOvertime.delete({ where: { id: row.id } });
        result.removed += 1;
      } else if (minutes !== row.minutes) {
        await this.prisma.payrollOvertime.update({
          where: { id: row.id },
          data: { minutes },
        });
        result.updated += 1;
      }
    }
    const fresh = [...found].filter(([key]) => !known.has(key));
    if (fresh.length > 0) {
      const created = await this.prisma.payrollOvertime.createMany({
        data: fresh.map(([key, minutes]) => {
          const [staffId, date] = key.split('|');
          return {
            schoolId: branch.schoolId,
            branchId,
            staffId,
            month,
            date: parseDate(date),
            minutes,
            source: 'ATTENDANCE' as const,
            reason: `Checked out after ${times?.leavesAt ?? 'leave time'}`,
          };
        }),
        skipDuplicates: true,
      });
      result.created = created.count;
    }
    return result;
  }
}
