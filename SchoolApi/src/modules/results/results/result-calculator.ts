import { bandFor, type BandRange } from '../grading/grade-bands';
import { divRound, hundredthsToNumber } from '../shared/hundredths';

export interface PaperSpec {
  paperId: string;
  subjectId: string;
  name: string;
  maxMarks: number;
  passMarks: number;
}

/** One student's entry for a paper; `marksH` in hundredths. */
export interface MarkEntry {
  marksH: number | null;
  absent: boolean;
}

export interface SchemeSpec {
  passPercent: number;
  bands: readonly (BandRange & { remark?: string | null })[];
}

/** Stored as `ExamResult.subjects` (JSON). */
export interface SubjectResult {
  subjectId: string;
  name: string;
  marks: number | null;
  maxMarks: number;
  absent: boolean;
  grade: string | null;
  passed: boolean;
}

export interface StudentComputation {
  subjects: SubjectResult[];
  totalH: number;
  maxTotal: number;
  /** Percent in hundredths (e.g. 8125 = 81.25 %). */
  percentH: number;
  grade: string;
  remark: string | null;
  passed: boolean;
}

/** Pending = not entered and not absent (never treated as zero). */
export const isPending = (entry: MarkEntry | undefined): boolean =>
  !entry || (!entry.absent && entry.marksH === null);

export function pendingPapers(
  papers: readonly PaperSpec[],
  marks: ReadonlyMap<string, MarkEntry>,
): string[] {
  return papers
    .filter((p) => isPending(marks.get(p.paperId)))
    .map((p) => p.paperId);
}

/**
 * Totals, percent (2 dp, half up), grade by band of floor(percent), and
 * pass rules: a subject passes when present with marks ≥ passMarks; overall
 * pass needs every subject passed and percent ≥ scheme.passPercent. Absent
 * counts as 0 in the total but fails the subject.
 */
export function computeStudent(
  papers: readonly PaperSpec[],
  marks: ReadonlyMap<string, MarkEntry>,
  scheme: SchemeSpec,
): StudentComputation {
  const pending = pendingPapers(papers, marks);
  if (pending.length > 0)
    throw new Error(`Pending marks for papers ${pending.join(', ')}`);
  let totalH = 0;
  let maxTotal = 0;
  const subjects = papers.map((paper): SubjectResult => {
    const entry = marks.get(paper.paperId)!;
    const marksH = entry.absent ? null : entry.marksH!;
    totalH += marksH ?? 0;
    maxTotal += paper.maxMarks;
    const subjectPercent =
      marksH === null || paper.maxMarks === 0
        ? null
        : Math.floor(marksH / paper.maxMarks);
    return {
      subjectId: paper.subjectId,
      name: paper.name,
      marks: marksH === null ? null : hundredthsToNumber(marksH),
      maxMarks: paper.maxMarks,
      absent: entry.absent,
      grade:
        subjectPercent === null
          ? null
          : (bandFor(scheme.bands, subjectPercent)?.grade ?? null),
      passed: marksH !== null && marksH >= paper.passMarks * 100,
    };
  });
  const percentH = maxTotal === 0 ? 0 : divRound(totalH * 100, maxTotal);
  const band = bandFor(scheme.bands, Math.floor(percentH / 100));
  return {
    subjects,
    totalH,
    maxTotal,
    percentH,
    grade: band?.grade ?? '-',
    remark: band?.remark ?? null,
    passed:
      subjects.every((s) => s.passed) && percentH >= scheme.passPercent * 100,
  };
}

/** Standard competition ranking by percent desc ("1, 2, 2, 4"). */
export function rankByPercent(
  items: readonly { id: string; percentH: number }[],
): Map<string, number> {
  const sorted = [...items].sort((a, b) => b.percentH - a.percentH);
  const ranks = new Map<string, number>();
  sorted.forEach((item, index) => {
    const prev = sorted[index - 1];
    ranks.set(
      item.id,
      prev && prev.percentH === item.percentH ? ranks.get(prev.id)! : index + 1,
    );
  });
  return ranks;
}
