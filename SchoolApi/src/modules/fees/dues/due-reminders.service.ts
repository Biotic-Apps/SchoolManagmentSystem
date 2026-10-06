import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { forbidden, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../tasks/async-task.service';
import type { InvoiceJobDto } from '../invoices/dto/invoice.dto';
import { FeeAccessService } from '../shared/fee-access.service';
import {
  DUE_REMINDERS_JOB,
  type DueRemindersInput,
} from './due-reminders.processor';

/** Queues guardian reminders for students the caller manages. */
@Injectable()
export class DueRemindersService {
  constructor(
    private readonly access: FeeAccessService,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    studentIds: string[],
  ): Promise<InvoiceJobDto> {
    if (scope.guardian) throw forbidden('Not available to parents');
    let schoolId: string | null = null;
    let branchId: string | null = null;
    for (const studentId of studentIds) {
      const student = await this.access.student(studentId);
      if (!student) throw notFound('Student');
      const branch = student.branchId;
      if (branch)
        scope.assertManageBranch({ id: branch, schoolId: student.schoolId });
      else scope.assertManageSchool(student.schoolId);
      schoolId ??= student.schoolId;
      branchId ??= branch;
    }
    const jobId = await this.tasks.enqueue<DueRemindersInput>(user, {
      queue: QUEUES.NOTIFICATIONS,
      name: DUE_REMINDERS_JOB,
      data: { studentIds },
      schoolId,
      branchId,
    });
    this.audit.stage({
      action: 'dues.reminders',
      entityType: 'AsyncTask',
      entityId: jobId,
      schoolId,
      branchId,
      after: { studentIds },
    });
    return { jobId };
  }
}
