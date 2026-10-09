import type { GridColumn } from './pdf-extras';

interface PaperLike {
  subjectId: string;
  maxMarks: number;
}

interface StudentLike {
  name: string;
  rollNo: number | null;
}

const BASE: GridColumn[] = [
  { header: 'Sr', width: 0.5, align: 'right' },
  { header: 'Roll', width: 0.7, align: 'right' },
  { header: 'Student', width: 3.2 },
];

/**
 * Award list columns: one per subject with its max marks (plus a total), or
 * for a single paper: marks, marks in words and remarks.
 */
export function awardColumns(
  papers: PaperLike[],
  subjects: Map<string, string>,
  singlePaper: boolean,
): GridColumn[] {
  if (singlePaper) {
    const paper = papers[0];
    return [
      ...BASE,
      {
        header: 'Marks',
        sub: `(out of ${paper?.maxMarks ?? ''})`,
        width: 1.2,
        align: 'center',
      },
      { header: 'Marks in words', width: 2.4 },
      { header: 'Remarks', width: 1.8 },
    ];
  }
  const total = papers.reduce((sum, p) => sum + p.maxMarks, 0);
  return [
    ...BASE,
    ...papers.map((p) => ({
      header: subjects.get(p.subjectId) ?? '',
      sub: `(${p.maxMarks})`,
      width: 1,
      align: 'center' as const,
    })),
    { header: 'Total', sub: `(${total})`, width: 1, align: 'center' },
  ];
}

/** Empty rows at the end for late admissions. */
export const SPARE_ROWS = 2;

/** One row per student (plus spare rows); mark cells left blank for hand entry. */
export function awardRows(
  students: StudentLike[],
  paperCount: number,
  singlePaper: boolean,
): string[][] {
  const width = 3 + (singlePaper ? 3 : paperCount + 1);
  const rows = students.map((s, i) => [
    String(i + 1),
    s.rollNo?.toString() ?? '',
    s.name,
  ]);
  for (let i = 0; i < SPARE_ROWS; i++) rows.push([]);
  return rows.map((r) => [...r, ...Array<string>(width - r.length).fill('')]);
}
