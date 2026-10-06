import { Injectable } from '@nestjs/common';
import type { MarkSheetStatus } from '../../../generated/prisma/client';
import { conflict } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { LookupService } from '../shared/lookup.service';

export interface OpenSheet {
  id: string;
  className: string;
  sectionName: string;
  subjectName: string;
  status: MarkSheetStatus;
}

/** Results need every mark sheet ACCEPTED (409 with the open ones). */
@Injectable()
export class ExamReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {}

  async assertAllAccepted(examId: string): Promise<void> {
    const total = await this.prisma.markSheet.count({ where: { examId } });
    if (total === 0) throw conflict('The exam has no mark sheets');
    const open = await this.openSheets(examId);
    if (open.length > 0)
      throw conflict('Some mark sheets are not accepted yet', { sheets: open });
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
