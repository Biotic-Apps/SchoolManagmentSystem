import { Injectable } from '@nestjs/common';
import type {
  PayrollRun,
  PayrollRunStatus,
  Prisma,
} from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { AsyncTaskService } from '../../tasks/async-task.service';
import {
  PAYROLL_CALCULATE_JOB,
  type PayrollCalculateInput,
} from '../calculation/jobs/payroll-calculate.processor';
import { assertCalculable } from '../calculation/payroll-calculation.service';
import { PayrollAccess } from '../payroll-access.service';
import type { PayrollRunDto } from './dto/run.dto';
import { RunViewService } from './run-view.service';

/** calculate (job) → review → … → close. Approval and payments live elsewhere. */
@Injectable()
export class RunWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly tasks: AsyncTaskService,
    private readonly view: RunViewService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async calculate(
    user: AuthUser,
    scope: Scope,
    runId: string,
  ): Promise<{ jobId: string }> {
    const run = await this.access.run(scope, runId);
    assertCalculable(run);
    const jobId = await this.tasks.enqueue<PayrollCalculateInput>(user, {
      queue: QUEUES.PAYROLL,
      name: PAYROLL_CALCULATE_JOB,
      data: { runId: run.id, userId: user.id },
      schoolId: run.schoolId,
      branchId: run.branchId,
    });
    return { jobId };
  }

  async review(
    user: AuthUser,
    scope: Scope,
    runId: string,
  ): Promise<PayrollRunDto> {
    const run = await this.access.run(scope, runId);
    if (run.status !== 'CALCULATED') {
      throw conflict('Only a CALCULATED payroll run can be reviewed');
    }
    await this.transition(run, 'REVIEWED', {
      reviewedById: user.id,
      reviewedAt: new Date(),
    });
    const approvers = [
      ...(await this.people.roleHolders(run.branchId, RoleKey.PRINCIPAL)),
      ...[await this.people.principalOf(run.branchId)].filter(
        (id): id is string => !!id,
      ),
    ].filter((id) => id !== user.id);
    await this.notifications.notify({
      userIds: approvers,
      category: 'PAYROLL',
      title: `Payroll ${run.month} ready for approval`,
      body: 'The payroll run was reviewed and awaits your approval.',
      data: { runId: run.id },
    });
    return this.view.one(run.id);
  }

  async close(
    user: AuthUser,
    scope: Scope,
    runId: string,
  ): Promise<PayrollRunDto> {
    const run = await this.access.run(scope, runId);
    const unpaid = await this.prisma.payrollLine.count({
      where: { runId: run.id, status: { not: 'PAID' } },
    });
    if (run.status !== 'PAID' || unpaid > 0) {
      throw conflict('All salaries must be paid before closing', {
        unpaidLines: unpaid,
      });
    }
    await this.transition(run, 'CLOSED', {
      closedById: user.id,
      closedAt: new Date(),
    });
    return this.view.one(run.id);
  }

  private async transition(
    run: PayrollRun,
    status: PayrollRunStatus,
    data: Prisma.PayrollRunUncheckedUpdateManyInput,
  ): Promise<void> {
    const updated = await this.prisma.payrollRun.updateMany({
      where: { id: run.id, version: run.version, status: run.status },
      data: { ...data, status, version: { increment: 1 } },
    });
    if (updated.count === 0) throw conflict('Payroll run changed, reload');
    this.audit.stage({
      action: `payroll.run_${status.toLowerCase()}`,
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      before: { status: run.status },
      after: { status },
    });
  }
}
