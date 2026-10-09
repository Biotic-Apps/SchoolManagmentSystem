import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { PdfBuilder } from '../../../generated-docs/pdf-builder';
import { ExamPrintContext } from '../exam-print-context';
import { pageFooter, signatureLines } from '../pdf-extras';
import type { ComposedPdf, ExamPrintInput } from '../print-job';
import { dateSheetRows } from '../print-format';
import { slug, today } from '../print-names';

/** Printable date sheet: one page per class from the exam schedule. */
@Injectable()
export class DateSheetComposer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ExamPrintContext,
  ) {}

  async compose(input: ExamPrintInput): Promise<ComposedPdf> {
    const ctx = await this.context.load(input.examId);
    const roomIds = ctx.papers.flatMap((p) => (p.roomId ? [p.roomId] : []));
    const rooms = new Map(
      (
        await this.prisma.room.findMany({
          where: { id: { in: roomIds } },
          select: { id: true, name: true },
        })
      ).map((r) => [r.id, r.name]),
    );
    const classIds = input.classIds.filter((id) =>
      ctx.papers.some((p) => p.classId === id),
    );
    const pdf = new PdfBuilder();
    classIds.forEach((classId, index) => {
      if (index > 0) pdf.doc.addPage();
      const papers = ctx.papers.filter((p) => p.classId === classId);
      const rows = dateSheetRows(papers, ctx.subjects, rooms);
      const showRoom = rows.some((r) => r[6]);
      pdf
        .header(ctx.schoolName, ctx.branchLine, `Date Sheet — ${ctx.examName}`)
        .fields([
          ['Class', ctx.classes.get(classId) ?? ''],
          ['Session', ctx.sessionName],
        ])
        .table(
          [
            { header: 'Date', weight: 1.6 },
            { header: 'Day', weight: 1.2 },
            { header: 'Time', weight: 1.9 },
            { header: 'Subject', weight: 2.2 },
            { header: 'Max', align: 'right', weight: 0.7 },
            { header: 'Pass', align: 'right', weight: 0.7 },
            ...(showRoom ? [{ header: 'Room', weight: 1.1 }] : []),
          ],
          rows.map((r) => (showRoom ? r : r.slice(0, 6))),
        )
        .paragraph(
          'Students should reach the exam hall 15 minutes before the paper starts and bring their own stationery.',
          { size: 8.5 },
        );
      signatureLines(pdf, ['Exam coordinator', 'Principal']);
      pageFooter(
        pdf,
        `${ctx.schoolName} · ${ctx.sessionName} · printed ${today()}`,
      );
    });
    const label =
      classIds.length === 1
        ? (ctx.classes.get(classIds[0]) ?? '')
        : 'all-classes';
    return {
      buffer: await pdf.toBuffer(),
      baseName: `date-sheet-${slug(ctx.examName)}-${slug(label)}`,
      count: classIds.length,
    };
  }
}
