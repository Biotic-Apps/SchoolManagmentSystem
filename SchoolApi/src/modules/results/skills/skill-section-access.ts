import { Injectable } from '@nestjs/common';
import type { Exam } from '../../../generated/prisma/client';
import {
  forbiddenScope,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ExamAccessService } from '../shared/exam-access.service';

export interface ExamSection {
  exam: Exam;
  section: { id: string; branchId: string; schoolId: string; classId: string };
  /** Teachers of the section and branch managers, until the exam is published. */
  editable: boolean;
}

/**
 * An exam section for staff, the same reach as marks: branch managers and
 * the section's teachers (class teacher or a subject teacher there).
 */
@Injectable()
export class SkillSectionAccess {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exams: ExamAccessService,
  ) {}

  async resolve(
    scope: Scope,
    examId: string,
    sectionId: string,
  ): Promise<ExamSection> {
    if (scope.guardian) throw notFound('Exam');
    const exam = await this.exams.read(scope, examId);
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        branchId: true,
        schoolId: true,
        classId: true,
        sessionId: true,
      },
    });
    if (!section) throw notFound('Section');
    if (
      section.branchId !== exam.branchId ||
      section.sessionId !== exam.sessionId ||
      !exam.classIds.includes(section.classId)
    )
      throw invalid('This section does not sit this exam');
    if (!scope.canReadSection(section)) throw forbiddenScope();
    return { exam, section, editable: exam.status !== 'PUBLISHED' };
  }
}
