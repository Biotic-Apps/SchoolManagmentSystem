import { Injectable } from '@nestjs/common';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../tasks/async-task.service';
import { ExamAccessService } from '../shared/exam-access.service';
import { ExamReadinessService } from './exam-readiness.service';
import {
  COMPUTE_RESULTS_JOB,
  type ComputeResultsInput,
} from './jobs/compute-results.processor';

/** POST /exams/:id/compute → { jobId } (reports queue). */
@Injectable()
export class ResultComputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ExamAccessService,
    private readonly readiness: ExamReadinessService,
    private readonly tasks: AsyncTaskService,
  ) {}

  async enqueue(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<{ jobId: string }> {
    const exam = await this.access.manage(scope, id);
    if (!['MARKS_OPEN', 'MARKS_CLOSED'].includes(exam.status))
      throw conflict(
        `Results cannot be computed while the exam is ${exam.status}`,
      );
    const scheme = await this.prisma.gradingScheme.findUniqueOrThrow({
      where: { id: exam.gradingSchemeId },
    });
    if (scheme.status !== 'APPROVED')
      throw conflict('The grading scheme is not approved');
    await this.readiness.assertAllAccepted(id);
    const jobId = await this.tasks.enqueue<ComputeResultsInput>(user, {
      queue: QUEUES.REPORTS,
      name: COMPUTE_RESULTS_JOB,
      data: { examId: id },
      schoolId: exam.schoolId,
      branchId: exam.branchId,
    });
    return { jobId };
  }
}
