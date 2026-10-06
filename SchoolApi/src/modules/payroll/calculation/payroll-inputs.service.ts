import { Injectable } from '@nestjs/common';
import type { PayrollAdjustment } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { periodEnd, periodStart } from '../../finance-core/period';
import { WorkingDayService } from '../../school-day/working-day.service';
import type { DayStatus, LeaveSpan } from './unpaid-days';

export interface StaffInputs {
  leaves: LeaveSpan[];
  attendance: Map<string, DayStatus>;
  adjustments: PayrollAdjustment[];
}

export interface MonthInputs {
  workingDays: string[];
  of(staffId: string): StaffInputs;
}

/** Loads attendance, approved staff leave and pending adjustments for a month. */
@Injectable()
export class PayrollInputsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workingDays: WorkingDayService,
  ) {}

  async load(
    branchId: string,
    month: string,
    staffIds: string[],
  ): Promise<MonthInputs> {
    const from = periodStart(month);
    const to = periodEnd(month);
    const [days, leaves, marks, adjustments] = await Promise.all([
      this.workingDays.between(branchId, from, to),
      this.prisma.leaveRequest.findMany({
        where: {
          kind: 'STAFF',
          staffId: { in: staffIds },
          status: 'APPROVED',
          fromDate: { lte: to },
          toDate: { gte: from },
        },
        select: { staffId: true, fromDate: true, toDate: true, type: true },
      }),
      this.prisma.staffAttendance.findMany({
        where: { staffId: { in: staffIds }, date: { gte: from, lte: to } },
        select: { staffId: true, date: true, status: true },
      }),
      this.prisma.payrollAdjustment.findMany({
        where: { staffId: { in: staffIds }, month, status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    const workingDays = days.map(formatDate);
    return {
      workingDays,
      of: (staffId) => ({
        leaves: leaves
          .filter((l) => l.staffId === staffId)
          .map((l) => ({
            from: formatDate(l.fromDate),
            to: formatDate(l.toDate),
            unpaid: l.type === 'UNPAID',
          })),
        attendance: new Map(
          marks
            .filter((m) => m.staffId === staffId)
            .map((m) => [formatDate(m.date), m.status as DayStatus]),
        ),
        adjustments: adjustments.filter((a) => a.staffId === staffId),
      }),
    };
  }
}
