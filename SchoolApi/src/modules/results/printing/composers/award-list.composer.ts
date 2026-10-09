import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { PdfBuilder } from '../../../generated-docs/pdf-builder';
import { RosterService } from '../../shared/roster.service';
import { ExamPrintContext, type ExamPrintHeader } from '../exam-print-context';
import { pageFooter, ruledGrid, signatureLines } from '../pdf-extras';
import type { ComposedPdf, ExamPrintInput } from '../print-job';
import { awardColumns, awardRows } from '../award-list-layout';
import { paperDate } from '../print-format';
import { slug, today } from '../print-names';

/** Blank award lists (marks-entry sheets): one page per section. */
@Injectable()
export class AwardListComposer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ExamPrintContext,
    private readonly roster: RosterService,
  ) {}

  async compose(input: ExamPrintInput): Promise<ComposedPdf> {
    const ctx = await this.context.load(input.examId);
    const sections = await this.prisma.section.findMany({
      where: { id: { in: input.sectionIds } },
      select: { id: true, name: true, classId: true },
    });
    const order = new Map(input.sectionIds.map((id, i) => [id, i]));
    sections.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    const rosters = await this.roster.many(input.sectionIds);
    const widest = Math.max(
      ...sections.map(
        (s) => ctx.papers.filter((p) => p.classId === s.classId).length,
      ),
    );
    const pdf = new PdfBuilder({ landscape: !input.subjectId && widest > 6 });
    let pages = 0;
    for (const section of sections) {
      const papers = ctx.papers.filter(
        (p) =>
          p.classId === section.classId &&
          (!input.subjectId || p.subjectId === input.subjectId),
      );
      if (papers.length === 0) continue;
      if (pages++ > 0) pdf.doc.addPage();
      const label = `${ctx.classes.get(section.classId) ?? ''} — ${section.name}`;
      this.title(pdf, ctx, label, papers, input.subjectId);
      const students = rosters.get(section.id) ?? [];
      ruledGrid(
        pdf,
        awardColumns(papers, ctx.subjects, !!input.subjectId),
        awardRows(students, papers.length, !!input.subjectId),
        {
          rowHeight: 20,
          bottom: 110,
          onPage: () =>
            pdf.paragraph(`${ctx.examName} · ${label} (continued)`, {
              size: 9,
            }),
        },
      );
      signatureLines(
        pdf,
        input.subjectId
          ? ['Subject teacher', 'Class teacher', 'Exam coordinator']
          : ['Class teacher', 'Exam coordinator', 'Principal'],
      );
      pageFooter(
        pdf,
        `${ctx.schoolName} · ${ctx.examName} · award list · printed ${today()}`,
      );
    }
    if (pages === 0) pdf.paragraph('No papers to print for these sections.');
    const subject = input.subjectId ? ctx.subjects.get(input.subjectId) : null;
    const name =
      sections.length === 1
        ? `${ctx.classes.get(sections[0].classId) ?? ''} ${sections[0].name}`
        : 'sections';
    return {
      buffer: await pdf.toBuffer(),
      baseName: `award-list-${slug(ctx.examName)}-${slug(name)}${subject ? `-${slug(subject)}` : ''}`,
      count: pages,
    };
  }

  private title(
    pdf: PdfBuilder,
    ctx: ExamPrintHeader,
    label: string,
    papers: ExamPrintHeader['papers'],
    subjectId: string | undefined,
  ): void {
    pdf.header(ctx.schoolName, ctx.branchLine, `Award List — ${ctx.examName}`);
    const single = subjectId ? papers[0] : null;
    pdf.fields([
      ['Class / section', label],
      ['Session', ctx.sessionName],
      ...(single
        ? ([
            ['Subject', ctx.subjects.get(single.subjectId) ?? ''],
            [
              'Paper date · max / pass marks',
              `${paperDate(single.date)} · ${single.maxMarks} / ${single.passMarks}`,
            ],
          ] as [string, string][])
        : []),
    ]);
  }
}
