import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { PdfBuilder } from '../../generated-docs/pdf-builder';
import { fullName } from '../../students/student.mapper';
import { decimalToNumber } from '../shared/hundredths';
import { subjectsOf } from '../results/result.mapper';

const num = (value: number | null) =>
  value === null
    ? '-'
    : Number.isInteger(value)
      ? String(value)
      : value.toFixed(2);

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** REPORT_CARD PDF of one ExamResult. */
@Injectable()
export class ReportCardRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'REPORT_CARD' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(resultId: string, version: number): Promise<RenderedDocument> {
    const result = await this.prisma.examResult.findUniqueOrThrow({
      where: { id: resultId },
      include: {
        exam: true,
        student: {
          select: { firstName: true, lastName: true, admissionNo: true },
        },
      },
    });
    const [school, branch, section, session, enrollment] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({ where: { id: result.schoolId } }),
      this.prisma.branch.findUniqueOrThrow({ where: { id: result.branchId } }),
      this.prisma.section.findUniqueOrThrow({
        where: { id: result.sectionId },
        include: { schoolClass: { select: { name: true } } },
      }),
      this.prisma.academicSession.findUniqueOrThrow({
        where: { id: result.exam.sessionId },
      }),
      this.prisma.enrollment.findFirst({
        where: { studentId: result.studentId, sectionId: result.sectionId },
        orderBy: { startDate: 'desc' },
        select: { rollNo: true },
      }),
    ]);
    const percent = decimalToNumber(result.percent) ?? 0;
    const subjects = subjectsOf(result);
    const pdf = new PdfBuilder()
      .header(
        school.name,
        [branch.name, branch.address, branch.phone].filter(Boolean).join(' · '),
        `Report Card — ${result.exam.name}`,
      )
      .fields([
        ['Student', fullName(result.student)],
        ['Admission no', result.student.admissionNo],
        ['Class', section.schoolClass.name],
        ['Section', section.name],
        ['Roll no', enrollment?.rollNo?.toString() ?? '-'],
        ['Session', session.name],
      ])
      .heading('Subjects')
      .table(
        [
          { header: 'Subject', weight: 3 },
          { header: 'Marks', align: 'right' },
          { header: 'Max', align: 'right' },
          { header: 'Grade', align: 'center' },
          { header: 'Result', align: 'center' },
        ],
        [
          ...subjects.map((s) => [
            s.name,
            s.absent ? 'Absent' : num(s.marks),
            String(s.maxMarks),
            s.grade ?? '-',
            s.passed ? 'Pass' : 'Fail',
          ]),
          [
            'Total',
            num(decimalToNumber(result.totalMarks)),
            String(result.maxTotal),
            result.grade,
            result.passed ? 'Pass' : 'Fail',
          ],
        ],
        { boldLastRow: true },
      )
      .fields([
        ['Percentage', `${percent.toFixed(2)}%`],
        ['Grade', result.grade],
        ['Position', result.position?.toString() ?? '-'],
        ['Result', result.passed ? 'Passed' : 'Not passed'],
      ]);
    if (result.remarks || result.teacherRemark) {
      pdf.heading('Remarks');
      if (result.remarks) pdf.paragraph(result.remarks);
      if (result.teacherRemark)
        pdf.paragraph(`Teacher: ${result.teacherRemark}`);
    }
    pdf.footer(
      `${school.name} · generated ${new Date().toISOString().slice(0, 10)} · version ${version}`,
    );
    return {
      buffer: await pdf.toBuffer(),
      fileName: `report-card-${slug(result.student.admissionNo)}-${slug(result.exam.name)}-v${version}.pdf`,
    };
  }
}
