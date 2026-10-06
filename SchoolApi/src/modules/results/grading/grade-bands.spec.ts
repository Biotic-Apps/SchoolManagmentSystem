import { bandFor, bandProblems, type BandRange } from './grade-bands';

const standard: BandRange[] = [
  { grade: 'F', minPercent: 0, maxPercent: 32 },
  { grade: 'D', minPercent: 33, maxPercent: 49 },
  { grade: 'C', minPercent: 50, maxPercent: 69 },
  { grade: 'B', minPercent: 70, maxPercent: 79 },
  { grade: 'A', minPercent: 80, maxPercent: 89 },
  { grade: 'A+', minPercent: 90, maxPercent: 100 },
];

describe('grade bands', () => {
  it('accepts contiguous bands in any order', () => {
    expect(bandProblems([...standard].reverse())).toEqual([]);
    expect(
      bandProblems([{ grade: 'P', minPercent: 0, maxPercent: 100 }]),
    ).toEqual([]);
  });

  it('rejects gaps, overlaps and incomplete coverage', () => {
    const gap = standard.map((b) =>
      b.grade === 'D' ? { ...b, minPercent: 34 } : b,
    );
    expect(bandProblems(gap)).toEqual(['Gap between F and D']);
    const overlap = standard.map((b) =>
      b.grade === 'D' ? { ...b, minPercent: 30 } : b,
    );
    expect(bandProblems(overlap)).toEqual(['Grades F and D overlap']);
    expect(bandProblems(standard.slice(1))).toContain('Bands must start at 0');
    expect(bandProblems(standard.slice(0, -1))).toContain(
      'Bands must end at 100',
    );
    expect(bandProblems([])).toHaveLength(1);
  });

  it('rejects invalid single bands', () => {
    expect(
      bandProblems([{ grade: 'X', minPercent: 0, maxPercent: 100.5 }]),
    ).toHaveLength(2);
    expect(
      bandProblems([{ grade: 'X', minPercent: 60, maxPercent: 10 }]),
    ).toContain('Grade X: min is above max');
    expect(
      bandProblems([
        { grade: 'a', minPercent: 0, maxPercent: 50 },
        { grade: 'A', minPercent: 51, maxPercent: 100 },
      ]),
    ).toEqual(['Grade A is repeated']);
  });

  it('finds the band of a whole percent', () => {
    expect(bandFor(standard, 0)?.grade).toBe('F');
    expect(bandFor(standard, 32)?.grade).toBe('F');
    expect(bandFor(standard, 33)?.grade).toBe('D');
    expect(bandFor(standard, 100)?.grade).toBe('A+');
    expect(bandFor(standard, 120)?.grade).toBe('A+');
  });
});
