import {
  computeStudent,
  isPending,
  pendingPapers,
  rankByPercent,
  type MarkEntry,
  type PaperSpec,
  type SchemeSpec,
} from './result-calculator';

const scheme: SchemeSpec = {
  passPercent: 40,
  bands: [
    { grade: 'F', minPercent: 0, maxPercent: 39, remark: 'Fail' },
    { grade: 'C', minPercent: 40, maxPercent: 59, remark: null },
    { grade: 'B', minPercent: 60, maxPercent: 79, remark: null },
    { grade: 'A', minPercent: 80, maxPercent: 100, remark: 'Excellent' },
  ],
};

const papers: PaperSpec[] = [
  {
    paperId: 'p1',
    subjectId: 'math',
    name: 'Maths',
    maxMarks: 100,
    passMarks: 33,
  },
  {
    paperId: 'p2',
    subjectId: 'eng',
    name: 'English',
    maxMarks: 50,
    passMarks: 17,
  },
  {
    paperId: 'p3',
    subjectId: 'sci',
    name: 'Science',
    maxMarks: 75,
    passMarks: 25,
  },
];

const marks = (entries: Record<string, MarkEntry>) =>
  new Map(Object.entries(entries));
const m = (value: number): MarkEntry => ({
  marksH: Math.round(value * 100),
  absent: false,
});
const absent: MarkEntry = { marksH: null, absent: true };
const pending: MarkEntry = { marksH: null, absent: false };

describe('result calculator', () => {
  it('computes totals, percent, grade and pass', () => {
    const result = computeStudent(
      papers,
      marks({ p1: m(90), p2: m(45.5), p3: m(60) }),
      scheme,
    );
    expect(result.totalH).toBe(19550);
    expect(result.maxTotal).toBe(225);
    expect(result.percentH).toBe(8689); // 86.888… → 86.89
    expect(result.grade).toBe('A');
    expect(result.remark).toBe('Excellent');
    expect(result.passed).toBe(true);
    expect(result.subjects[1]).toEqual({
      subjectId: 'eng',
      name: 'English',
      marks: 45.5,
      maxMarks: 50,
      absent: false,
      grade: 'A',
      passed: true,
    });
  });

  it('rounds percent half up on hundredths', () => {
    const one: PaperSpec[] = [{ ...papers[0], maxMarks: 8, passMarks: 0 }];
    // 1/8 = 12.5 % exactly; 1/3 = 33.333…; 2/3 = 66.666…
    expect(computeStudent(one, marks({ p1: m(1) }), scheme).percentH).toBe(
      1250,
    );
    const three: PaperSpec[] = [{ ...papers[0], maxMarks: 3, passMarks: 0 }];
    expect(computeStudent(three, marks({ p1: m(1) }), scheme).percentH).toBe(
      3333,
    );
    expect(computeStudent(three, marks({ p1: m(2) }), scheme).percentH).toBe(
      6667,
    );
  });

  it('uses floor(percent) for the band', () => {
    const one: PaperSpec[] = [{ ...papers[0], maxMarks: 1000, passMarks: 0 }];
    const result = computeStudent(one, marks({ p1: m(399.9) }), scheme);
    expect(result.percentH).toBe(3999);
    expect(result.grade).toBe('F');
    expect(result.passed).toBe(false); // 39.99 < 40
  });

  it('counts absent as zero but fails that subject', () => {
    const result = computeStudent(
      papers,
      marks({ p1: m(100), p2: m(50), p3: absent }),
      scheme,
    );
    expect(result.totalH).toBe(15000);
    expect(result.percentH).toBe(6667);
    expect(result.passed).toBe(false);
    expect(result.subjects[2]).toMatchObject({
      absent: true,
      marks: null,
      grade: null,
      passed: false,
    });
  });

  it('fails overall when one subject is below pass marks even with a high percent', () => {
    const result = computeStudent(
      papers,
      marks({ p1: m(100), p2: m(16.5), p3: m(75) }),
      scheme,
    );
    expect(result.subjects[1].passed).toBe(false);
    expect(result.percentH).toBeGreaterThan(8000);
    expect(result.passed).toBe(false);
  });

  it('fails overall below the pass percent even when every subject passes', () => {
    const result = computeStudent(
      papers,
      marks({ p1: m(33), p2: m(17), p3: m(25) }),
      scheme,
    );
    expect(result.subjects.every((s) => s.passed)).toBe(true);
    expect(result.percentH).toBe(3333);
    expect(result.passed).toBe(false);
  });

  it('treats pass marks as inclusive and zero marks as entered', () => {
    expect(isPending(m(0))).toBe(false);
    const result = computeStudent(
      papers,
      marks({ p1: m(33), p2: m(0), p3: m(75) }),
      scheme,
    );
    expect(result.subjects[0].passed).toBe(true);
    expect(result.subjects[1]).toMatchObject({
      marks: 0,
      passed: false,
      grade: 'F',
    });
  });

  it('refuses pending marks instead of using zero', () => {
    expect(isPending(pending)).toBe(true);
    expect(isPending(undefined)).toBe(true);
    expect(isPending(absent)).toBe(false);
    const entries = marks({ p1: m(10), p2: pending });
    expect(pendingPapers(papers, entries)).toEqual(['p2', 'p3']);
    expect(() => computeStudent(papers, entries, scheme)).toThrow(/Pending/);
  });

  it('ranks with standard competition ranking', () => {
    const ranks = rankByPercent([
      { id: 'a', percentH: 7000 },
      { id: 'b', percentH: 9000 },
      { id: 'c', percentH: 8000 },
      { id: 'd', percentH: 8000 },
      { id: 'e', percentH: 6000 },
    ]);
    expect(Object.fromEntries(ranks)).toEqual({ b: 1, c: 2, d: 2, a: 4, e: 5 });
    expect(rankByPercent([])).toEqual(new Map());
  });
});
