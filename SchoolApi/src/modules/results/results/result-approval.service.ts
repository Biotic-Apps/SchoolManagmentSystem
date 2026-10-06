import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { principalOrAbove } from '../../finance-core/approval-routing';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { ExamDto } from '../exams/dto/exam.dto';
import { ExamMapper } from '../exams/exam.mapper';
import { ExamAccessService } from '../shared/exam-access.service';
import { ExamReadinessService } from './exam-readiness.service';

/**
 * POST /exams/:id/approve-results: closes marks entry and asks the principal
 * (super admin for a principal's own request) via RESULT_PUBLISH.
 */
@Injectable()
export class ResultApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ExamAccessService,
    private readonly readiness: ExamReadinessService,
    private readonly approvals: ApprovalService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly mapper: ExamMapper,
    private readonly audit: AuditService,
  ) {}

  async request(user: AuthUser, scope: Scope, id: string): Promise<ExamDto> {
    const exam = await this.access.manage(scope, id);
    if (!['MARKS_OPEN', 'MARKS_CLOSED'].includes(exam.status))
      throw conflict(
        `Results cannot be sent for approval while ${exam.status}`,
      );
    if (exam.approvalId) {
      const pending = await this.prisma.approvalRequest.count({
        where: { id: exam.approvalId, status: 'PENDING' },
      });
      if (pending > 0) throw conflict('Results are already awaiting approval');
    }
    await this.readiness.assertAllAccepted(id);
    await this.readiness.assertComputed(exam);

    const steps = principalOrAbove(user.activeRole);
    await this.prisma.$transaction(async (tx) => {
      const approval = await this.approvals.create(
        {
          type: 'RESULT_PUBLISH',
          entityType: 'Exam',
          entityId: id,
          schoolId: exam.schoolId,
          branchId: exam.branchId,
          requestedById: user.id,
          title: `Results: ${exam.name}`,
          payload: { examId: id },
          steps,
        },
        tx,
      );
      await tx.exam.update({
        where: { id },
        data: {
          status: 'MARKS_CLOSED',
          approvalId: approval.id,
          version: { increment: 1 },
        },
      });
    });
    this.audit.stage({
      action: 'exam.results_request',
      entityType: 'Exam',
      entityId: id,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      before: { status: exam.status },
      after: { status: 'MARKS_CLOSED' },
    });
    const deciders =
      steps[0].approverRole === String(RoleKey.SUPER_ADMIN)
        ? await this.people.superAdmins()
        : [await this.people.principalOf(exam.branchId)];
    await this.notifications.notify({
      userIds: deciders.filter((u): u is string => !!u && u !== user.id),
      category: 'APPROVAL',
      title: 'Results awaiting approval',
      body: `${exam.name} results are ready for approval.`,
      data: { examId: id },
    });
    return this.mapper.withPapers(id);
  }
}
