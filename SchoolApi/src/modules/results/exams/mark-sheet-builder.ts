import { Injectable } from '@nestjs/common';
import type { Exam, ExamPaper, Prisma } from '../../../generated/prisma/client';

/**
 * One mark sheet per paper × active section of the paper's class in the
 * exam's session. Teacher: the subject teacher of that section, else the
 * class teacher.
 */
@Injectable()
export class MarkSheetBuilder {
  async build(
    tx: Prisma.TransactionClient,
    exam: Exam,
    papers: ExamPaper[],
  ): Promise<number> {
    const sections = await tx.section.findMany({
      where: {
        sessionId: exam.sessionId,
        branchId: exam.branchId,
        classId: { in: [...new Set(papers.map((p) => p.classId))] },
        status: 'ACTIVE',
      },
      select: { id: true, classId: true, classTeacherStaffId: true },
    });
    const assignments = await tx.staffAssignment.findMany({
      where: {
        kind: 'SUBJECT_TEACHER',
        endedAt: null,
        sectionId: { in: sections.map((s) => s.id) },
      },
      orderBy: { isSubstitute: 'asc' },
      select: { staffId: true, sectionId: true, subjectId: true },
    });
    const teacherOf = new Map<string, string>();
    for (const a of assignments) {
      const key = `${a.sectionId}:${a.subjectId}`;
      if (!teacherOf.has(key)) teacherOf.set(key, a.staffId);
    }
    let count = 0;
    for (const paper of papers) {
      for (const section of sections.filter(
        (s) => s.classId === paper.classId,
      )) {
        const teacherStaffId =
          teacherOf.get(`${section.id}:${paper.subjectId}`) ??
          section.classTeacherStaffId;
        await tx.markSheet.upsert({
          where: {
            paperId_sectionId: { paperId: paper.id, sectionId: section.id },
          },
          create: {
            schoolId: exam.schoolId,
            branchId: exam.branchId,
            examId: exam.id,
            paperId: paper.id,
            sectionId: section.id,
            subjectId: paper.subjectId,
            teacherStaffId,
          },
          update: { subjectId: paper.subjectId, teacherStaffId },
        });
        count++;
      }
    }
    return count;
  }
}
