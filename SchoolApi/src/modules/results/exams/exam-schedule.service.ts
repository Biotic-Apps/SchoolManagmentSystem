import { Injectable } from '@nestjs/common';
import type { Exam } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate, parseDate } from '../../../core/common/dates';
import { conflict, invalid } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ExamAccessService } from '../shared/exam-access.service';
import type { ExamDto } from './dto/exam.dto';
import type { ScheduleExamDto, SchedulePaperDto } from './dto/schedule.dto';
import { ExamMapper } from './exam.mapper';
import { MarkSheetBuilder } from './mark-sheet-builder';
import { paperKey, paperProblems } from './paper-checks';
import { findClashes, type SlotPaper } from './schedule-clash';

/** PUT /exams/:id/schedule: papers per class/subject, clash check, mark sheets. */
@Injectable()
export class ExamScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ExamAccessService,
    private readonly sheets: MarkSheetBuilder,
    private readonly mapper: ExamMapper,
    private readonly audit: AuditService,
  ) {}

  async schedule(
    scope: Scope,
    id: string,
    dto: ScheduleExamDto,
  ): Promise<ExamDto> {
    const exam = await this.access.manage(scope, id);
    if (!['DRAFT', 'SCHEDULED'].includes(exam.status))
      throw conflict('The schedule can only change before marks entry opens');
    await this.assertPapers(exam, dto.papers);
    await this.assertNoClash(exam, dto.papers);

    const keep = new Set(dto.papers.map(paperKey));
    const count = await this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.examPaper.findMany({ where: { examId: id } });
        const removed = existing.filter((p) => !keep.has(paperKey(p)));
        if (removed.length > 0)
          await tx.examPaper.deleteMany({
            where: { id: { in: removed.map((p) => p.id) } },
          });
        const papers = [];
        for (const p of dto.papers) {
          const data = {
            date: parseDate(p.date),
            startTime: p.startTime,
            endTime: p.endTime,
            maxMarks: p.maxMarks,
            passMarks: p.passMarks,
            roomId: p.roomId ?? null,
          };
          papers.push(
            await tx.examPaper.upsert({
              where: {
                examId_classId_subjectId: {
                  examId: id,
                  classId: p.classId,
                  subjectId: p.subjectId,
                },
              },
              create: {
                examId: id,
                classId: p.classId,
                subjectId: p.subjectId,
                ...data,
              },
              update: data,
            }),
          );
        }
        await tx.exam.update({
          where: { id },
          data: { status: 'SCHEDULED', version: { increment: 1 } },
        });
        return this.sheets.build(tx, exam, papers);
      },
      { timeout: 30_000 },
    );
    this.audit.stage({
      action: 'exam.schedule',
      entityType: 'Exam',
      entityId: id,
      schoolId: exam.schoolId,
      branchId: exam.branchId,
      before: { status: exam.status },
      after: { status: 'SCHEDULED', papers: dto.papers, markSheets: count },
    });
    return this.mapper.withPapers(id);
  }

  private async assertPapers(exam: Exam, papers: SchedulePaperDto[]) {
    const [session, classSubjects, rooms] = await Promise.all([
      this.prisma.academicSession.findUniqueOrThrow({
        where: { id: exam.sessionId },
      }),
      this.prisma.classSubject.findMany({
        where: { classId: { in: exam.classIds }, status: 'ACTIVE' },
        select: { classId: true, subjectId: true },
      }),
      this.prisma.room.findMany({
        where: { branchId: exam.branchId, status: 'ACTIVE' },
        select: { id: true },
      }),
    ]);
    const problems = paperProblems(papers, {
      classIds: new Set(exam.classIds),
      classSubjects: new Set(classSubjects.map(paperKey)),
      roomIds: new Set(rooms.map((r) => r.id)),
      from: formatDate(session.startDate),
      to: formatDate(session.endDate),
    });
    if (problems.length > 0) throw invalid('Invalid exam papers', { problems });
  }

  /** Same class or room at overlapping times, also against the branch's other exams. */
  private async assertNoClash(exam: Exam, papers: SchedulePaperDto[]) {
    const dates = [...new Set(papers.map((p) => p.date))].map(parseDate);
    const others = await this.prisma.examPaper.findMany({
      where: {
        date: { in: dates },
        exam: { branchId: exam.branchId, id: { not: exam.id } },
      },
    });
    const slots: SlotPaper[] = papers.map((p) => ({
      examId: exam.id,
      classId: p.classId,
      subjectId: p.subjectId,
      date: p.date,
      startTime: p.startTime,
      endTime: p.endTime,
      roomId: p.roomId ?? null,
    }));
    const otherSlots: SlotPaper[] = others.map((p) => ({
      examId: p.examId,
      classId: p.classId,
      subjectId: p.subjectId,
      date: formatDate(p.date),
      startTime: p.startTime,
      endTime: p.endTime,
      roomId: p.roomId,
    }));
    const clashes = findClashes(slots, otherSlots);
    if (clashes.length > 0)
      throw conflict('The schedule has clashes', { clashes });
  }
}
