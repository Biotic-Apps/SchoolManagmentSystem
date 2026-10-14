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
  // Header: use custom overrides if provided
  const headerSchoolName = c.customHeaderOverrides?.schoolName ?? c.schoolName;
  const headerBranchLine = c.customHeaderOverrides
    ? [
        c.customHeaderOverrides.subtitle,
        c.customHeaderOverrides.address,
        c.customHeaderOverrides.phone,
      ]
        .filter(Boolean)
        .join(' · ') || c.branchLine
    : c.branchLine;

  pdf
    .header(
      headerSchoolName,
      headerBranchLine,
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
    );

  // Summary table: conditionally show position columns
  if (c.showPosition) {
    pdf.table(
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
  } else {
    pdf.table(
      [
        { header: 'Percentage', align: 'center' },
        { header: 'Grade', align: 'center' },
        { header: 'Result', align: 'center' },
      ],
      [
        [
          `${c.percent.toFixed(2)}%`,
          c.grade,
          c.passed ? 'Passed' : 'Not passed',
        ],
      ],
      { boldLastRow: true },
    );
  }

  // Attendance summary
  if (c.showAttendance && c.attendanceSummary) {
    pdf.table(
      [
        { header: 'Days present', align: 'center' },
        { header: 'Days absent', align: 'center' },
        { header: 'Total days', align: 'center' },
      ],
      [
        [
          String(c.attendanceSummary.present),
          String(c.attendanceSummary.absent),
          String(c.attendanceSummary.total),
        ],
      ],
    );
  }

  // Skills section
  if (c.showSkills && c.skills.length > 0) {
    pdf.heading('Behaviour & skills').table(
      [
        { header: SKILL_DOMAIN_LABEL.AFFECTIVE, weight: 2.4 },
        { header: 'Rating', weight: 1.6 },
        { header: SKILL_DOMAIN_LABEL.PSYCHOMOTOR, weight: 2.4 },
        { header: 'Rating', weight: 1.6 },
      ],
      skillRows(c.skills),
    );
    if (c.showGradingScale && c.scaleKey) {
      pdf.doc.moveUp(0.4);
      pdf.paragraph(`Key: ${c.scaleKey}`, { size: 7.5 });
    }
  }

  // Remarks section
  if (c.showRemarks && (c.remarks || c.teacherRemark)) {
    pdf.heading('Remarks');
    if (c.remarks) pdf.paragraph(c.remarks);
    if (c.teacherRemark) pdf.paragraph(`Class teacher: ${c.teacherRemark}`);
  }

  // Custom footer text (before signatures)
  if (c.customFooterText) {
    pdf.paragraph(c.customFooterText, { size: 8 });
  }

  const signatures = c.customSignatures ?? [
    'Class teacher',
    'Principal',
    'Parent / guardian',
  ];
  signatureLines(pdf, signatures);
  pageFooter(pdf, footer);
}
