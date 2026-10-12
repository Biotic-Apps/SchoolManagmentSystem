import { Injectable } from '@nestjs/common';
import { notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { PdfBuilder } from '../generated-docs/pdf-builder';
import type { PaperSectionDto } from './dto/exam-paper.dto';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: 'Multiple Choice',
  SHORT: 'Short Answer',
  LONG: 'Long Answer',
  TRUE_FALSE: 'True / False',
  FILL_BLANK: 'Fill in the Blank',
};

@Injectable()
export class ExamPaperPdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(scope: Scope, paperId: string): Promise<Buffer> {
    const paper = await this.prisma.generatedPaper.findUnique({
      where: { id: paperId },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        school: { select: { name: true } },
      },
    });
    if (!paper || !scope.schoolIds.has(paper.schoolId))
      throw notFound('Exam paper');

    // Fetch all questions referenced in sections
    const sections = paper.sections as unknown as PaperSectionDto[];
    const allQuestionIds = sections.flatMap((s) => s.questionIds);
    const questions = await this.prisma.question.findMany({
      where: { id: { in: allQuestionIds } },
    });
    const questionsById = new Map(questions.map((q) => [q.id, q]));

    const pdf = new PdfBuilder();
    pdf.header(
      paper.school.name,
      `${paper.class.name} | ${paper.subject.name}`,
      paper.title,
    );
    pdf.fields([
      ['Subject', paper.subject.name],
      ['Class', paper.class.name],
      ['Total Marks', String(paper.totalMarks)],
      ['Duration', `${paper.duration} minutes`],
    ]);

    let questionNumber = 1;
    for (const section of sections) {
      pdf.heading(`${section.title} (${section.marks} marks)`);
      for (const qId of section.questionIds) {
        const q = questionsById.get(qId);
        if (!q) continue;
        const typeLabel = QUESTION_TYPE_LABELS[q.questionType] ?? q.questionType;
        pdf.paragraph(
          `Q${questionNumber}. [${q.marks} marks | ${typeLabel}]  ${q.questionText}`,
          { size: 10 },
        );
        if (q.questionType === 'MCQ' && q.options) {
          const opts = q.options as string[];
          const optText = opts
            .map((opt, i) => `   ${String.fromCharCode(97 + i)}) ${opt}`)
            .join('\n');
          pdf.paragraph(optText, { size: 9 });
        }
        if (q.questionType === 'TRUE_FALSE') {
          pdf.paragraph('   a) True    b) False', { size: 9 });
        }
        if (q.questionType === 'FILL_BLANK') {
          pdf.paragraph('   Answer: __________________', { size: 9 });
        }
        questionNumber++;
      }
    }

    pdf.footer(
      `Generated on ${new Date().toLocaleDateString('en-PK')} | ${paper.school.name}`,
    );
    return pdf.toBuffer();
  }
}
