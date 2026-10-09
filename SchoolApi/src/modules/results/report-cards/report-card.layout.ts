import type { PdfBuilder } from '../../generated-docs/pdf-builder';
import { pageFooter, signatureLines } from '../printing/pdf-extras';
import { positionText } from '../results/standings';
import type { StudentSkillDto } from '../skills/dto/skill.dto';
import { SKILL_DOMAIN_LABEL } from '../skills/skill-defaults';
import type { ReportCardContent } from './report-card.loader';

const num = (value: number | null) =>
  value === null
    ? '-'
    : Number.isInteger(value)
      ? String(value)
      : value.toFixed(2);

const rating = (s: StudentSkillDto | undefined) =>
  s ? `${s.code}${s.label ? ` · ${s.label}` : ''}` : '';

/** Affective and psychomotor side by side: one row per pair. */
export function skillRows(skills: StudentSkillDto[]): string[][] {
  const affective = skills.filter((s) => s.domain === 'AFFECTIVE');
  const psychomotor = skills.filter((s) => s.domain === 'PSYCHOMOTOR');
  const rows: string[][] = [];
  for (let i = 0; i < Math.max(affective.length, psychomotor.length); i++) {
    rows.push([
      affective[i]?.name ?? '',
      rating(affective[i]),
      psychomotor[i]?.name ?? '',
      rating(psychomotor[i]),
    ]);
  }
  return rows;
}

/** Draws one report card on the builder's current page. */
export function drawReportCard(
  pdf: PdfBuilder,
  c: ReportCardContent,
  footer: string,
): void {
  pdf
    .header(
      c.schoolName,
      c.branchLine,
      `Report Card — ${c.examName} · ${c.sessionName}`,
    )
    .fields([
      ['Student', c.studentName],
      ['Admission no', c.admissionNo],
      ['Class', `${c.className} — ${c.sectionName}`],
      ['Roll no', c.rollNo?.toString() ?? '-'],
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
        ...c.subjects.map((s) => [
          s.name,
          s.absent ? 'Absent' : num(s.marks),
          String(s.maxMarks),
          s.grade ?? '-',
          s.passed ? 'Pass' : 'Fail',
        ]),
        [
          'Total',
          num(c.totalMarks),
          String(c.maxTotal),
          c.grade,
          c.passed ? 'Pass' : 'Fail',
        ],
      ],
      { boldLastRow: true },
    )
    .table(
      [
        { header: 'Percentage', align: 'center' },
        { header: 'Grade', align: 'center' },
        { header: 'Position in section', align: 'center' },
        { header: 'Position in class', align: 'center' },
        { header: 'Result', align: 'center' },
      ],
      [
        [
          `${c.percent.toFixed(2)}%`,
          c.grade,
          positionText(c.position, c.standing?.sectionSize ?? 0),
          positionText(
            c.position === null ? null : (c.standing?.classPosition ?? null),
            c.standing?.classSize ?? 0,
          ),
          c.passed ? 'Passed' : 'Not passed',
        ],
      ],
      { boldLastRow: true },
    );
  if (c.skills.length > 0) {
    pdf.heading('Behaviour & skills').table(
      [
        { header: SKILL_DOMAIN_LABEL.AFFECTIVE, weight: 2.4 },
        { header: 'Rating', weight: 1.6 },
        { header: SKILL_DOMAIN_LABEL.PSYCHOMOTOR, weight: 2.4 },
        { header: 'Rating', weight: 1.6 },
      ],
      skillRows(c.skills),
    );
    if (c.scaleKey) {
      pdf.doc.moveUp(0.4);
      pdf.paragraph(`Key: ${c.scaleKey}`, { size: 7.5 });
    }
  }
  if (c.remarks || c.teacherRemark) {
    pdf.heading('Remarks');
    if (c.remarks) pdf.paragraph(c.remarks);
    if (c.teacherRemark) pdf.paragraph(`Class teacher: ${c.teacherRemark}`);
  }
  signatureLines(pdf, ['Class teacher', 'Principal', 'Parent / guardian']);
  pageFooter(pdf, footer);
}
