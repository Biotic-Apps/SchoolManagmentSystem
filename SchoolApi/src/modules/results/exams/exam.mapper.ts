import { Injectable } from '@nestjs/common';
import type { Exam, ExamPaper } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { LookupService } from '../shared/lookup.service';
import type { ExamDto, ExamPaperDto } from './dto/exam.dto';

export type ExamWithPapers = Exam & { papers?: ExamPaper[] };

const byPaperOrder = (a: ExamPaper, b: ExamPaper) =>
  a.date.getTime() - b.date.getTime() || a.startTime.localeCompare(b.startTime);

@Injectable()
export class ExamMapper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {}

  async one(exam: ExamWithPapers): Promise<ExamDto> {
    return (await this.many([exam]))[0];
  }

  async withPapers(examId: string): Promise<ExamDto> {
    const exam = await this.prisma.exam.findUniqueOrThrow({
      where: { id: examId },
      include: { papers: true },
    });
    return this.one(exam);
  }

  async many(exams: ExamWithPapers[]): Promise<ExamDto[]> {
    const papers = exams.flatMap((e) => e.papers ?? []);
    const [classes, subjects, schemes] = await Promise.all([
      this.lookup.classes([
        ...exams.flatMap((e) => e.classIds),
        ...papers.map((p) => p.classId),
      ]),
      this.lookup.subjects(papers.map((p) => p.subjectId)),
      this.prisma.gradingScheme.findMany({
        where: { id: { in: exams.map((e) => e.gradingSchemeId) } },
        select: { id: true, name: true },
      }),
    ]);
    const schemeNames = new Map(schemes.map((s) => [s.id, s.name]));
    const paperDto = (p: ExamPaper): ExamPaperDto => ({
      id: p.id,
      classId: p.classId,
      className: classes.get(p.classId) ?? '',
      subject: { id: p.subjectId, name: subjects.get(p.subjectId) ?? '' },
      date: formatDate(p.date),
      startTime: p.startTime,
      endTime: p.endTime,
      maxMarks: p.maxMarks,
      passMarks: p.passMarks,
      roomId: p.roomId,
    });
    return exams.map((e) => ({
      id: e.id,
      schoolId: e.schoolId,
      branchId: e.branchId,
      sessionId: e.sessionId,
      termId: e.termId,
      name: e.name,
      type: e.type,
      gradingScheme: {
        id: e.gradingSchemeId,
        name: schemeNames.get(e.gradingSchemeId) ?? '',
      },
      weightPercent: e.weightPercent,
      classIds: e.classIds,
      classes: e.classIds.map((id) => ({ id, name: classes.get(id) ?? '' })),
      status: e.status,
      approvalId: e.approvalId,
      computedAt: e.computedAt?.toISOString() ?? null,
      publishedAt: e.publishedAt?.toISOString() ?? null,
      papers: [...(e.papers ?? [])].sort(byPaperOrder).map(paperDto),
      createdAt: e.createdAt.toISOString(),
    }));
  }
}
