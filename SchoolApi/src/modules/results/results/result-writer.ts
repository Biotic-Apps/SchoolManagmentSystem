import { Injectable } from '@nestjs/common';
import type { Exam, ExamPaper, Mark } from '../../../generated/prisma/client';
import { toJson } from '../../../core/common/prisma-json';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { formatHundredths, toHundredths } from '../shared/hundredths';
import { LookupService } from '../shared/lookup.service';
import { RosterService } from '../shared/roster.service';
import {
  computeStudent,
  pendingPapers,
  rankByPercent,
  type MarkEntry,
  type PaperSpec,
  type SchemeSpec,
  type StudentComputation,
} from './result-calculator';

interface Computed extends StudentComputation {
  studentId: string;
  sectionId: string;
  classId: string;
}

const entryOf = (mark: Mark): MarkEntry => ({
  absent: mark.absent,
  marksH: mark.absent || mark.marks === null ? null : toHundredths(mark.marks),
});

/** Computes all results of an exam and upserts ExamResult rows (one per student). */
@Injectable()
export class ResultWriter {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roster: RosterService,
    private readonly lookup: LookupService,
    private readonly settings: BranchSettingsReader,
  ) {}

  async run(examId: string): Promise<number> {
    const exam = await this.prisma.exam.findUniqueOrThrow({
      where: { id: examId },
      include: {
        papers: true,
        gradingScheme: { include: { bands: true } },
        markSheets: { include: { marks: true } },
      },
    });
    if (['RESULTS_APPROVED', 'PUBLISHED'].includes(exam.status))
      throw new Error('Results are already approved');
    const scheme: SchemeSpec = {
      passPercent: exam.gradingScheme.passPercent,
      bands: exam.gradingScheme.bands,
    };
    const subjects = await this.lookup.subjects(
      exam.papers.map((p) => p.subjectId),
    );
    const sheetClass = new Map(exam.papers.map((p) => [p.id, p.classId]));
    const sections = new Map<string, string>();
    for (const s of exam.markSheets)
      sections.set(s.sectionId, sheetClass.get(s.paperId)!);
    const rosters = await this.roster.many([...sections.keys()]);
    const marks = new Map<string, Mark>();
    for (const s of exam.markSheets)
      for (const m of s.marks) marks.set(`${s.paperId}:${m.studentId}`, m);

    const computed: Computed[] = [];
    const pending: { studentId: string; paperIds: string[] }[] = [];
    for (const [sectionId, classId] of sections) {
      const papers = this.paperSpecs(exam.papers, classId, subjects);
      for (const student of rosters.get(sectionId) ?? []) {
        const entries = new Map<string, MarkEntry>();
        for (const p of papers) {
          const mark = marks.get(`${p.paperId}:${student.studentId}`);
          if (mark) entries.set(p.paperId, entryOf(mark));
        }
        const missing = pendingPapers(papers, entries);
        if (missing.length > 0)
          pending.push({ studentId: student.studentId, paperIds: missing });
        else
          computed.push({
            studentId: student.studentId,
            sectionId,
            classId,
            ...computeStudent(papers, entries, scheme),
          });
      }
    }
    if (pending.length > 0)
      throw new Error(
        `Pending marks for ${pending.length} student(s): ${pending
          .map((p) => p.studentId)
          .join(', ')}`,
      );
    await this.save(exam, computed);
    return computed.length;
  }

  private paperSpecs(
    papers: ExamPaper[],
    classId: string,
    subjects: Map<string, string>,
  ): PaperSpec[] {
    return papers
      .filter((p) => p.classId === classId)
      .sort(
        (a, b) =>
          a.date.getTime() - b.date.getTime() ||
          a.startTime.localeCompare(b.startTime),
      )
      .map((p) => ({
        paperId: p.id,
        subjectId: p.subjectId,
        name: subjects.get(p.subjectId) ?? '',
        maxMarks: p.maxMarks,
        passMarks: p.passMarks,
      }));
  }

  private async save(exam: Exam, computed: Computed[]): Promise<void> {
    const positions = await this.settings.get<boolean>(
      exam.branchId,
      'exams.positionsEnabled',
    );
    const ranks = new Map<string, number>();
    for (const sectionId of new Set(computed.map((c) => c.sectionId))) {
      const ranked = rankByPercent(
        computed
          .filter((c) => c.sectionId === sectionId)
          .map((c) => ({ id: c.studentId, percentH: c.percentH })),
      );
      for (const [id, rank] of ranked) ranks.set(id, rank);
    }
    const now = new Date();
    await this.prisma.$transaction(
      async (tx) => {
        await tx.examResult.deleteMany({
          where: {
            examId: exam.id,
            studentId: { notIn: computed.map((c) => c.studentId) },
          },
        });
        for (const c of computed) {
          const data = {
            sectionId: c.sectionId,
            classId: c.classId,
            totalMarks: formatHundredths(c.totalH),
            maxTotal: c.maxTotal,
            percent: formatHundredths(c.percentH),
            grade: c.grade,
            position: positions ? (ranks.get(c.studentId) ?? null) : null,
            passed: c.passed,
            remarks: c.remark,
            subjects: toJson(c.subjects),
            computedAt: now,
          };
          await tx.examResult.upsert({
            where: {
              examId_studentId: { examId: exam.id, studentId: c.studentId },
            },
            create: {
              schoolId: exam.schoolId,
              branchId: exam.branchId,
              examId: exam.id,
              studentId: c.studentId,
              ...data,
            },
            update: data,
          });
        }
        await tx.exam.update({
          where: { id: exam.id },
          data: { computedAt: now },
        });
      },
      { timeout: 60_000 },
    );
  }
}
