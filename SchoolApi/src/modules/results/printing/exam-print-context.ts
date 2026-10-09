import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { LookupService, type NameMap } from '../shared/lookup.service';

export interface ExamPrintHeader {
  examName: string;
  schoolName: string;
  branchLine: string;
  sessionName: string;
  papers: {
    classId: string;
    subjectId: string;
    date: Date;
    startTime: string;
    endTime: string;
    maxMarks: number;
    passMarks: number;
    roomId: string | null;
  }[];
  classes: NameMap;
  subjects: NameMap;
}

/** Exam, school/branch header text and papers shared by the exam prints. */
@Injectable()
export class ExamPrintContext {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {}

  async load(examId: string): Promise<ExamPrintHeader> {
    const exam = await this.prisma.exam.findUniqueOrThrow({
      where: { id: examId },
      include: {
        papers: { orderBy: [{ date: 'asc' }, { startTime: 'asc' }] },
      },
    });
    const [school, branch, session, classes, subjects] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({ where: { id: exam.schoolId } }),
      this.prisma.branch.findUniqueOrThrow({ where: { id: exam.branchId } }),
      this.prisma.academicSession.findUniqueOrThrow({
        where: { id: exam.sessionId },
      }),
      this.lookup.classes(exam.classIds),
      this.lookup.subjects(exam.papers.map((p) => p.subjectId)),
    ]);
    return {
      examName: exam.name,
      schoolName: school.name,
      branchLine: [branch.name, branch.address, branch.phone]
        .filter(Boolean)
        .join(' · '),
      sessionName: session.name,
      papers: exam.papers,
      classes,
      subjects,
    };
  }
}
