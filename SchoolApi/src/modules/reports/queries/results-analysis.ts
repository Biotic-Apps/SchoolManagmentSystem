import { fullName } from '../../students/student.mapper';
import { percent } from '../report-table';
import { str, type ReportQuery } from './report-query';

/** Per section and subject: average %, pass rate and top scorer. */
export const resultsAnalysis: ReportQuery = async ({ prisma, params }) => {
  const examId = str(params, 'examId');
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { name: true },
  });
  const sheets = await prisma.markSheet.findMany({
    where: { examId },
    select: {
      paper: { select: { maxMarks: true, passMarks: true } },
      sectionId: true,
      subjectId: true,
      marks: {
        where: { absent: false, marks: { not: null } },
        select: {
          marks: true,
          student: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
  const [sectionRows, subjectRows] = await Promise.all([
    prisma.section.findMany({
      where: { id: { in: sheets.map((s) => s.sectionId) } },
      select: {
        id: true,
        name: true,
        schoolClass: { select: { name: true, levelOrder: true } },
      },
    }),
    prisma.subject.findMany({
      where: { id: { in: sheets.map((s) => s.subjectId) } },
      select: { id: true, name: true },
    }),
  ]);
  const sections = new Map(sectionRows.map((s) => [s.id, s]));
  const subjects = new Map(subjectRows.map((s) => [s.id, s.name]));
  const rows = sheets
    .flatMap((sheet) => {
      const section = sections.get(sheet.sectionId);
      return section
        ? [
            {
              ...sheet,
              section,
              subject: { name: subjects.get(sheet.subjectId) ?? '' },
            },
          ]
        : [];
    })
    .sort(
      (a, b) =>
        a.section.schoolClass.levelOrder - b.section.schoolClass.levelOrder ||
        a.section.name.localeCompare(b.section.name) ||
        a.subject.name.localeCompare(b.subject.name),
    )
    .map((sheet) => {
      const scores = sheet.marks.map((m) => ({
        name: fullName(m.student),
        marks: Number(m.marks),
      }));
      const total = scores.reduce((sum, s) => sum + s.marks, 0);
      const top = scores.reduce<(typeof scores)[number] | null>(
        (best, s) => (!best || s.marks > best.marks ? s : best),
        null,
      );
      return {
        className: sheet.section.schoolClass.name,
        sectionName: sheet.section.name,
        subject: sheet.subject.name,
        students: scores.length,
        averagePercent: percent(total, scores.length * sheet.paper.maxMarks),
        passRate: percent(
          scores.filter((s) => s.marks >= sheet.paper.passMarks).length,
          scores.length,
        ),
        topScorer: top?.name ?? null,
        topMarks: top ? `${top.marks}/${sheet.paper.maxMarks}` : null,
      };
    });
  return {
    title: `Results analysis — ${exam?.name ?? 'Exam'}`,
    columns: [
      { key: 'className', header: 'Class' },
      { key: 'sectionName', header: 'Section' },
      { key: 'subject', header: 'Subject' },
      { key: 'students', header: 'Students', kind: 'int' },
      { key: 'averagePercent', header: 'Average %', kind: 'percent' },
      { key: 'passRate', header: 'Pass rate %', kind: 'percent' },
      { key: 'topScorer', header: 'Top scorer' },
      { key: 'topMarks', header: 'Top marks' },
    ],
    rows,
  };
};
