import { Injectable } from '@nestjs/common';
import type { LeaveRequest, Prisma } from '../../generated/prisma/client';
import { WorkingDayService } from '../school-day/working-day.service';

/** Approved leave fills LEAVE into attendance for those dates (flows §7.3). */
@Injectable()
export class LeaveAutofill {
  constructor(private readonly workingDays: WorkingDayService) {}

  async apply(
    leave: LeaveRequest,
    tx: Prisma.TransactionClient,
    markedById: string | null,
  ): Promise<void> {
    if (leave.studentId) {
      await tx.attendanceEntry.updateMany({
        where: {
          studentId: leave.studentId,
          register: {
            date: { gte: leave.fromDate, lte: leave.toDate },
            status: { in: ['DRAFT', 'SUBMITTED', 'PENDING_REVIEW'] },
          },
        },
        data: { status: 'LEAVE' },
      });
      return;
    }
    if (!leave.staffId) return;
    const days = await this.workingDays.between(
      leave.branchId,
      leave.fromDate,
      leave.toDate,
    );
    for (const date of days) {
      await tx.staffAttendance.upsert({
        where: { staffId_date: { staffId: leave.staffId, date } },
        create: {
          schoolId: leave.schoolId,
          branchId: leave.branchId,
          staffId: leave.staffId,
          date,
          status: 'LEAVE',
          remark: 'Approved leave',
          markedById,
        },
        update: { status: 'LEAVE', remark: 'Approved leave', markedById },
      });
    }
  }
}
