import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { ApprovalsRepository } from '../../../core/approvals/approvals.repository';
import { parseDate } from '../../../core/common/dates';
import { forbidden, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AttendanceSummaryService } from '../../attendance/attendance-summary.service';
import { DiaryMissingService } from '../../diary/diary-missing.service';
import { WorkingDayService } from '../../school-day/working-day.service';
import type {
  DashboardPendingDto,
  PendingQueryDto,
} from '../dto/daily-dashboard.dto';

const OPEN_COMPLAINT = {
  notIn: ['RESOLVED', 'CLOSED'] as ('RESOLVED' | 'CLOSED')[],
};

/** Principal/coordinator pending list (contract §12). */
@Injectable()
export class PendingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalsRepository,
    private readonly attendance: AttendanceSummaryService,
    private readonly diaries: DiaryMissingService,
    private readonly workingDays: WorkingDayService,
  ) {}

  async pending(
    user: AuthUser,
    scope: Scope,
    query: PendingQueryDto,
  ): Promise<DashboardPendingDto> {
    if (scope.guardian || scope.sectionLimited)
      throw forbidden('Only principals and coordinators have a pending list');
    const branchIds = await this.branches(scope, query.branchId);
    const day = query.date ? parseDate(query.date) : today();
    const inBranches = { branchId: { in: branchIds } };
    const dayEnd = new Date(day.getTime() + 86_400_000);
    const open: string[] = [];
    for (const id of branchIds)
      if (await this.workingDays.isWorkingDay(id, day)) open.push(id);
    const [unmarked, missing] = await Promise.all([
      Promise.all(
        open.map((id) => this.attendance.unmarked(scope, id, query.date)),
      ),
      Promise.all(open.map((id) => this.diaries.missing(id, day))),
    ]);
    const complaints: Prisma.ComplaintWhereInput = {
      ...inBranches,
      status: OPEN_COMPLAINT,
      againstUserId: { not: user.id },
    };
    const [
      pendingApprovals,
      pendingLeave,
      openComplaints,
      overdueComplaints,
      delayedTopics,
      todayIncidents,
      earlyLeavesToday,
      staffAbsentToday,
    ] = await Promise.all([
      this.approvals.countPending(scope, user.id, user.activeRole),
      this.prisma.leaveRequest.count({
        where: { ...inBranches, status: 'SUBMITTED' },
      }),
      this.prisma.complaint.count({ where: complaints }),
      this.prisma.complaint.count({
        where: { ...complaints, slaDueAt: { lt: new Date() } },
      }),
      this.prisma.syllabusTopic.count({
        where: {
          status: { not: 'COMPLETED' },
          targetDate: { lt: day },
          plan: {
            ...inBranches,
            status: 'APPROVED',
            session: { status: 'ACTIVE' },
          },
        },
      }),
      this.prisma.healthIncident.count({
        where: { ...inBranches, occurredAt: { gte: day, lt: dayEnd } },
      }),
      this.prisma.earlyLeave.count({
        where: { ...inBranches, date: day, status: { not: 'REJECTED' } },
      }),
      this.prisma.staffAttendance.count({
        where: { ...inBranches, date: day, status: 'ABSENT' },
      }),
    ]);
    return {
      unmarkedAttendance: unmarked.flat().length,
      missingDiaries: missing.flat().length,
      pendingApprovals,
      pendingLeave,
      openComplaints,
      overdueComplaints,
      delayedTopics,
      todayIncidents,
      earlyLeavesToday,
      staffAbsentToday,
    };
  }

  private async branches(scope: Scope, branchId?: string): Promise<string[]> {
    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch) throw notFound('Branch');
      scope.assertReadBranch(branch);
      return [branch.id];
    }
    const rows = await this.prisma.branch.findMany({
      where: {
        status: 'ACTIVE',
        ...(scope.global
          ? {}
          : {
              OR: [
                { schoolId: { in: [...scope.schoolIds] } },
                { id: { in: [...scope.branchIds] } },
              ],
            }),
      },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}
