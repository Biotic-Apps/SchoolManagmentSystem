import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbiddenScope,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../tasks/async-task.service';
import type { JobIdDto } from '../exams/dto/exam.dto';
import { ExamAccessService } from '../shared/exam-access.service';
import type { ExamPrintDto } from './dto/print.dto';
import { EXAM_PRINT_JOB, type ExamPrintInput } from './print-job';
import { printTargets } from './print-targets';

/** POST /exams/:id/print: queues a bulk PDF (cards, date sheet, award list). */
@Injectable()
export class ExamPrintService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exams: ExamAccessService,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    examId: string,
    dto: ExamPrintDto,
  ): Promise<JobIdDto> {
    if (scope.guardian) throw notFound('Exam');
    const exam = await this.exams.read(scope, examId);
    const sections = await this.prisma.section.findMany({
      where: {
        branchId: exam.branchId,
        sessionId: exam.sessionId,
        classId: { in: exam.classIds },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        classId: true,
        branchId: true,
        schoolId: true,
        schoolClass: { select: { levelOrder: true } },
      },
      orderBy: [{ schoolClass: { levelOrder: 'asc' } }, { name: 'asc' }],
    });
    const targets = printTargets(
      [...exam.classIds].sort(
        (a, b) =>
          (sections.find((s) => s.classId === a)?.schoolClass.levelOrder ?? 0) -
          (sections.find((s) => s.classId === b)?.schoolClass.levelOrder ?? 0),
      ),
      sections.map((s) => ({ ...s, readable: scope.canReadSection(s) })),
      dto,
    );
    if (!targets.ok)
      throw targets.reason === 'invalid'
        ? invalid(targets.message)
        : forbiddenScope(targets.message);
    await this.assertPrintable(exam.id, dto, targets.sectionIds);

    const input: ExamPrintInput = {
      examId: exam.id,
      kind: dto.kind,
      schoolId: exam.schoolId,
      requestedById: user.id,
      sectionIds: targets.sectionIds,
      classIds: targets.classIds,
      subjectId: dto.kind === 'AWARD_LIST' ? dto.subjectId : undefined,
      templateId: dto.kind === 'REPORT_CARDS' ? dto.templateId : undefined,
    };
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.DOCUMENTS,
      name: EXAM_PRINT_JOB,
      data: input,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      format: 'PDF',
    });
    this.audit.stage({
      action: 'exam.print',
      entityType: 'Exam',
      entityId: exam.id,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      after: {
        kind: dto.kind,
        sections: targets.sectionIds.length,
        classes: targets.classIds.length,
        jobId,
      },
    });
    return { jobId };
  }

  private async assertPrintable(
    examId: string,
    dto: ExamPrintDto,
    sectionIds: string[],
  ): Promise<void> {
    if (dto.kind === 'REPORT_CARDS') {
      const results = await this.prisma.examResult.count({
        where: { examId, sectionId: { in: sectionIds } },
      });
      if (results === 0)
        throw conflict('No computed results for these sections yet');
      return;
    }
    const papers = await this.prisma.examPaper.findMany({
      where: { examId },
      select: { subjectId: true },
    });
    if (papers.length === 0) throw conflict('The exam has no schedule yet');
    if (dto.subjectId && !papers.some((p) => p.subjectId === dto.subjectId))
      throw invalid('This subject has no paper in the exam');
  }
}
