import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { PdfBuilder } from '../../../generated-docs/pdf-builder';
import { drawReportCard } from '../../report-cards/report-card.layout';
import { ReportCardLoader } from '../../report-cards/report-card.loader';
import { RosterService } from '../../shared/roster.service';
import type { ComposedPdf, ExamPrintInput, Progress } from '../print-job';
import { slug, today } from '../print-names';

/** Every student's report card of the chosen sections in one PDF. */
@Injectable()
export class ReportCardsComposer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loader: ReportCardLoader,
    private readonly roster: RosterService,
  ) {}

  async compose(
    input: ExamPrintInput,
    progress: Progress,
  ): Promise<ComposedPdf> {
    const exam = await this.prisma.exam.findUniqueOrThrow({
      where: { id: input.examId },
      select: { name: true, status: true },
    });
    const results = await this.prisma.examResult.findMany({
      where: { examId: input.examId, sectionId: { in: input.sectionIds } },
      select: { id: true, studentId: true, sectionId: true },
    });
    const ordered = await this.inRosterOrder(input.sectionIds, results);
    const pdf = new PdfBuilder();
    const stamp = `generated ${today()}`;
    for (const [index, result] of ordered.entries()) {
      if (index > 0) pdf.doc.addPage();
      const content = await this.loader.load(result.id);
      drawReportCard(pdf, content, `${content.schoolName} · ${stamp}`);
      if (exam.status !== 'PUBLISHED') pdf.watermark('PROVISIONAL');
      if (index % 5 === 4)
        await progress(5 + (85 * (index + 1)) / ordered.length);
    }
    const label =
      input.sectionIds.length === 1
        ? await this.sectionLabel(input.sectionIds[0])
        : 'all-sections';
    return {
      buffer: await pdf.toBuffer(),
      baseName: `report-cards-${slug(exam.name)}-${slug(label)}`,
      count: ordered.length,
    };
  }

  /** Section order as requested, roll numbers inside a section. */
  private async inRosterOrder<
    T extends { studentId: string; sectionId: string },
  >(sectionIds: string[], results: T[]): Promise<T[]> {
    const rosters = await this.roster.many(sectionIds);
    const rank = new Map<string, number>();
    let i = 0;
    for (const sectionId of sectionIds)
      for (const s of rosters.get(sectionId) ?? []) rank.set(s.studentId, i++);
    const sectionRank = new Map(sectionIds.map((id, n) => [id, n]));
    return [...results].sort(
      (a, b) =>
        (sectionRank.get(a.sectionId) ?? 0) -
          (sectionRank.get(b.sectionId) ?? 0) ||
        (rank.get(a.studentId) ?? 1e9) - (rank.get(b.studentId) ?? 1e9),
    );
  }

  private async sectionLabel(sectionId: string): Promise<string> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { name: true, schoolClass: { select: { name: true } } },
    });
    return section ? `${section.schoolClass.name} ${section.name}` : 'section';
  }
}
