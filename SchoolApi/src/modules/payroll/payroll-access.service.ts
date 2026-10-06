import { Injectable } from '@nestjs/common';
import type { PayrollRun, Staff } from '../../generated/prisma/client';
import { notFound } from '../../core/common/errors/errors';
import { parseDate } from '../../core/common/dates';
import { schoolDate } from '../../core/common/school-time';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { periodOf } from '../finance-core/period';

/** Current payroll month (`YYYY-MM`) on the school clock. */
export const currentMonth = (): string => periodOf(parseDate(schoolDate()));

/**
 * Payroll data is visible only to payroll permission holders who manage the
 * staff member's branch (BRANCH-scoped accountant/principal, school/global admins).
 */
@Injectable()
export class PayrollAccess {
  constructor(private readonly prisma: PrismaService) {}

  async staff(scope: Scope, staffId: string): Promise<Staff> {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff) throw notFound('Staff');
    scope.assertManageBranch({ id: staff.branchId, schoolId: staff.schoolId });
    return staff;
  }

  async run(scope: Scope, runId: string): Promise<PayrollRun> {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id: runId },
    });
    if (!run) throw notFound('Payroll run');
    scope.assertManageBranch({ id: run.branchId, schoolId: run.schoolId });
    return run;
  }

  async branch(scope: Scope, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, schoolId: true, name: true, principalUserId: true },
    });
    if (!branch) throw notFound('Branch');
    scope.assertManageBranch(branch);
    return branch;
  }
}
