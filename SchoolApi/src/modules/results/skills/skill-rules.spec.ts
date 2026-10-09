import {
  completeCount,
  configProblems,
  ratingProblems,
  withSortOrder,
} from './skill-rules';
import { DEFAULT_SKILL_ITEMS, DEFAULT_SKILL_SCALE } from './skill-defaults';

const scale = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    value: i + 1,
    code: String(i + 1),
    label: `L${i + 1}`,
  }));

describe('skill config rules', () => {
  it('accepts the defaults', () => {
    expect(configProblems(DEFAULT_SKILL_ITEMS, DEFAULT_SKILL_SCALE)).toEqual(
      [],
    );
  });

  it('flags duplicate names within a domain (case/space insensitive)', () => {
    const problems = configProblems(
      [
        { domain: 'AFFECTIVE', name: 'Neatness' },
        { domain: 'AFFECTIVE', name: ' neatness ' },
        { domain: 'PSYCHOMOTOR', name: 'Neatness' },
      ],
      scale(3),
    );
    expect(problems).toEqual(['"neatness" is listed twice']);
  });

  it('needs scale values 1..N without gaps and distinct codes', () => {
    expect(
      configProblems(
        [],
        [
          { value: 1, code: 'A', label: 'x' },
          { value: 3, code: 'a', label: 'y' },
        ],
      ),
    ).toEqual([
      'Scale values must run 1, 2, 3… without gaps',
      'Scale codes must differ',
    ]);
  });

  it('numbers items per domain in list order and trims names', () => {
    const items = withSortOrder([
      { domain: 'AFFECTIVE' as const, name: ' A ' },
      { domain: 'PSYCHOMOTOR' as const, name: 'P' },
      { domain: 'AFFECTIVE' as const, name: 'B' },
    ]);
    expect(items.map((i) => [i.name, i.sortOrder])).toEqual([
      ['A', 1],
      ['P', 1],
      ['B', 2],
    ]);
  });
});

describe('ratingProblems', () => {
  const students = new Set(['s1', 's2']);
  const items = new Set(['i1', 'i2']);

  it('accepts ratings and clears in range', () => {
    expect(
      ratingProblems(
        [
          { studentId: 's1', itemId: 'i1', value: 5 },
          { studentId: 's2', itemId: 'i2', value: null },
        ],
        students,
        items,
        5,
      ),
    ).toEqual([]);
  });

  it('rejects outsiders, unknown items, out-of-scale values and duplicates', () => {
    const problems = ratingProblems(
      [
        { studentId: 'x', itemId: 'i1', value: 1 },
        { studentId: 's1', itemId: 'zz', value: 1 },
        { studentId: 's1', itemId: 'i1', value: 6 },
        { studentId: 's1', itemId: 'i1', value: 2 },
      ],
      students,
      items,
      5,
    );
    expect(problems).toEqual([
      'Student x is not in this section',
      'Item zz is not an active skill',
      'Rating must be between 1 and 5',
      'Duplicate rating s1:i1',
    ]);
  });
});

describe('completeCount', () => {
  it('counts students with every item rated', () => {
    const ratings = new Map<string, Record<string, number>>([
      ['s1', { i1: 5, i2: 4 }],
      ['s2', { i1: 3 }],
      ['s3', {}],
    ]);
    expect(completeCount(ratings, ['i1', 'i2'])).toBe(1);
    expect(completeCount(ratings, [])).toBe(0);
  });
});
