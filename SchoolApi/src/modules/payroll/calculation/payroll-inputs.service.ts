import { Injectable } from '@nestjs/common';
import type { PayrollAdjustment } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { periodEnd, periodStart } from '../../finance-core/period';
import { WorkingDayService } from '../../school-day/working-day.service';
import { PayrollSettingsService } from '../settings/payroll-settings.service';
import type { PayrollRules } from '../settings/payroll-rules';
import { staffTimings } from '../settings/staff-timings';
import { dailyHoursFromTimings } from './overtime-pay';
import type { DayStatus, LeaveSpan } from './unpaid-days';

export interface StaffOvertime {
  approvedIds: string[];
  approvedMinutes: number;
  pendingMinutes: number;
}

export interface StaffInputs {
  leaves: LeaveSpan[];
  attendance: Map<string, DayStatus>;
  adjustments: PayrollAdjustment[];
  overtime: StaffOvertime;
}

export interface MonthInputs {
  workingDays: string[];
  /** Days the salary is divided by (calendar or the fixed setting). */
  payDays: number;
  /** Paid hours a day for the overtime rate. */
  dailyHours: number;
  rules: PayrollRules;
  of(staffId: string): StaffInputs;
}

/** Loads attendance, approved staff leave, adjustments, overtime and rules for a month. */
@Injectable()
export class PayrollInputsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workingDays: WorkingDayService,
    private readonly settings: PayrollSettingsService,
  ) {}

  async load(
    branchId: string,
    month: string,
    staffIds: string[],
  ): Promise<MonthInputs> {
    const from = periodStart(month);
    const to = periodEnd(month);
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: branchId },
      select: { schoolId: true, timings: true },
    });
    const [days, leaves, marks, adjustments, overtime, rules] =
      await Promise.all([
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
        this.prisma.payrollOvertime.findMany({
          where: {
            staffId: { in: staffIds },
            month,
            status: { in: ['PENDING', 'APPROVED'] },
          },
          select: { id: true, staffId: true, minutes: true, status: true },
        }),
        this.settings.rules(branch.schoolId),
      ]);
    const workingDays = days.map(formatDate);
    const times = staffTimings(branch.timings);
    const dailyHours =
      rules.dailyHours ??
      (times ? dailyHoursFromTimings(times.arrivesAt, times.leavesAt) : 8);
    return {
      workingDays,
      payDays:
        rules.workingDaysMode === 'FIXED'
          ? rules.fixedWorkingDays
          : workingDays.length,
      dailyHours,
      rules,
      of: (staffId) => {
        const own = overtime.filter((o) => o.staffId === staffId);
        const approved = own.filter((o) => o.status === 'APPROVED');
        return {
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
          overtime: {
            approvedIds: approved.map((o) => o.id),
            approvedMinutes: approved.reduce((s, o) => s + o.minutes, 0),
            pendingMinutes: own
              .filter((o) => o.status === 'PENDING')
              .reduce((s, o) => s + o.minutes, 0),
          },
        };
      },
    };
  }
}
