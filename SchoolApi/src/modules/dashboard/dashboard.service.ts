import { Injectable } from '@nestjs/common';
import { ApprovalsRepository } from '../../core/approvals/approvals.repository';
import { notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { Scope } from '../../core/rbac/scope/scope';
import { PrismaService } from '../../core/prisma/prisma.service';
import { attendanceToday } from './daily/attendance-today';
import { DashboardRepository } from './dashboard.repository';
import type { DashboardQueryDto } from './dto/dashboard-query.dto';
import type { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository,
    private readonly approvals: ApprovalsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async summary(
    user: AuthUser,
    scope: Scope,
    query: DashboardQueryDto,
  ): Promise<DashboardSummaryDto> {
    if (query.schoolId) scope.assertReadSchool(query.schoolId);
    if (query.branchId) {
      const branch = await this.repository.findBranch(query.branchId);
      if (!branch) throw notFound('Branch');
      scope.assertReadBranch(branch);
    }
    const [
      schools,
      branches,
      users,
      activeSessions,
      sections,
      pendingApprovals,
      students,
      staff,
      pendingAdmissions,
      pendingChildLinks,
      attendance,
    ] = await Promise.all([
      this.repository.schools(scope, query),
      this.repository.branches(scope, query),
      this.repository.users(scope, query),
      this.repository.activeSessions(scope, query),
      this.repository.sections(scope, query),
      this.approvals.countPending(scope, user.id, user.activeRole),
      this.repository.students(scope, query),
      this.repository.staff(scope, query),
      this.repository.pendingAdmissions(scope, query),
      this.repository.pendingChildLinks(scope, query),
      attendanceToday(this.prisma, scope, query.branchId),
    ]);
    return {
      schools,
      branches,
      users,
      activeSessions,
      sections,
      pendingApprovals,
      students,
      staff,
      pendingAdmissions,
      pendingChildLinks,
      attendanceToday: attendance,
    };
  }
}
