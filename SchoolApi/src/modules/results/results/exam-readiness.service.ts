import { Injectable } from '@nestjs/common';
import type { MarkSheetStatus } from '../../../generated/prisma/client';
import { conflict } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { pendingStudents } from '../mark-sheets/mark-rows';
import {
  describePending,
  type PendingSheet,
} from '../mark-sheets/sheet-review-rules';
import { LookupService } from '../shared/lookup.service';
import { RosterService } from '../shared/roster.service';

export interface OpenSheet {
  id: string;
  className: string;
  sectionName: string;
  subjectName: string;
  status: MarkSheetStatus;
}

export const openSheetsText = (open: readonly OpenSheet[]): string => {
  const parts = open.map(
    (s) =>
      `${s.className} ${s.sectionName} · ${s.subjectName} (${s.status.toLowerCase().replace('_', ' ')})`,
  );
  return parts.length > 5
    ? `${parts.slice(0, 5).join('; ')}; and ${parts.length - 5} more`
    : parts.join('; ');
};

/** Results need every mark sheet ACCEPTED (409 with the open ones). */
@Injectable()
export class ExamReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
    private readonly roster: RosterService,
  ) {}

  /**
   * Every sheet accepted and every active roster student entered or Absent
   * (409 naming the students, sections and subjects otherwise).
   */
  async assertReady(examId: string): Promise<void> {
    await this.assertAllAccepted(examId);
    const pending = await this.pendingSheets(examId);
    if (pending.length > 0)
      throw conflict(
        `Marks are missing for ${describePending(pending)}. Reopen marks entry and return those sheets to the teacher.`,
        { pending },
      );
  }

  /** Sheets with roster students who have neither marks nor Absent. */
  async pendingSheets(
    examId: string,
  ): Promise<(PendingSheet & { sheetId: string })[]> {
    const sheets = await this.prisma.markSheet.findMany({
      where: { examId },
      include: {
        paper: { select: { classId: true } },
        marks: { select: { studentId: true, absent: true, marks: true } },
      },
    });
    const rosters = await this.roster.many(sheets.map((s) => s.sectionId));
    const found: { sheet: (typeof sheets)[number]; students: string[] }[] = [];
    for (const sheet of sheets) {
      const roster = rosters.get(sheet.sectionId) ?? [];
      const entered = new Map(
        sheet.marks.map((m) => [
          m.studentId,
          { absent: m.absent, marksH: m.marks === null ? null : 1 },
        ]),
      );
      const ids = new Set(
        pendingStudents(
          roster.map((r) => r.studentId),
          entered,
        ),
      );
      if (ids.size > 0)
        found.push({
          sheet,
          students: roster
            .filter((r) => ids.has(r.studentId))
            .map((r) => r.name),
        });
    }
    if (found.length === 0) return [];
    const [classes, sections, subjects] = await Promise.all([
      this.lookup.classes(found.map((f) => f.sheet.paper.classId)),
      this.lookup.sections(found.map((f) => f.sheet.sectionId)),
      this.lookup.subjects(found.map((f) => f.sheet.subjectId)),
    ]);
    return found.map(({ sheet, students }) => ({
      sheetId: sheet.id,
      className: classes.get(sheet.paper.classId) ?? '',
      sectionName: sections.get(sheet.sectionId) ?? '',
      subjectName: subjects.get(sheet.subjectId) ?? '',
      students,
    }));
  }

  async assertAllAccepted(examId: string): Promise<void> {
    const total = await this.prisma.markSheet.count({ where: { examId } });
    if (total === 0) throw conflict('The exam has no mark sheets');
    const open = await this.openSheets(examId);
    if (open.length > 0)
      throw conflict(
        `Some mark sheets are not accepted yet: ${openSheetsText(open)}`,
        { sheets: open },
      );
  }

  async openSheets(examId: string): Promise<OpenSheet[]> {
    const sheets = await this.prisma.markSheet.findMany({
      where: { examId, status: { not: 'ACCEPTED' } },
      include: { paper: { select: { classId: true } } },
    });
    const [classes, sections, subjects] = await Promise.all([
      this.lookup.classes(sheets.map((s) => s.paper.classId)),
      this.lookup.sections(sheets.map((s) => s.sectionId)),
      this.lookup.subjects(sheets.map((s) => s.subjectId)),
    ]);
    return sheets.map((s) => ({
      id: s.id,
      className: classes.get(s.paper.classId) ?? '',
      sectionName: sections.get(s.sectionId) ?? '',
      subjectName: subjects.get(s.subjectId) ?? '',
      status: s.status,
    }));
  }

  /** Results exist and are newer than the last sheet decision. */
  async assertComputed(exam: { id: string; computedAt: Date | null }) {
    if (!exam.computedAt) throw conflict('Compute the results first');
    const latest = await this.prisma.markSheet.aggregate({
      where: { examId: exam.id },
      _max: { decidedAt: true },
    });
    const decided = latest._max.decidedAt;
    if (decided && decided > exam.computedAt)
      throw conflict('Marks changed after the last computation; compute again');
  }
}
