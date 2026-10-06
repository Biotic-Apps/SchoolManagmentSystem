import {
  parseComponents,
  sortStructures,
  structureFor,
} from './current-structure';

const row = (id: string, effectiveFrom: string, created: string) => ({
  id,
  effectiveFrom,
  createdAt: new Date(created),
});

const rows = [
  row('jan', '2026-01', '2026-01-02T00:00:00Z'),
  row('jun', '2026-06', '2026-05-20T00:00:00Z'),
  row('jun-fix', '2026-06', '2026-06-03T00:00:00Z'),
  row('dec', '2026-12', '2026-09-01T00:00:00Z'),
];

describe('salary structure selection', () => {
  it('orders history newest first (effectiveFrom, then createdAt)', () => {
    expect(sortStructures(rows).map((r) => r.id)).toEqual([
      'dec',
      'jun-fix',
      'jun',
      'jan',
    ]);
  });

  it('picks the latest structure effective on or before the month', () => {
    expect(structureFor(rows, '2026-03')?.id).toBe('jan');
    expect(structureFor(rows, '2026-10')?.id).toBe('jun-fix');
    expect(structureFor(rows, '2026-12')?.id).toBe('dec');
  });

  it('breaks ties of the same month by the newest row', () => {
    expect(structureFor(rows, '2026-06')?.id).toBe('jun-fix');
  });

  it('returns null before the first structure', () => {
    expect(structureFor(rows, '2025-12')).toBeNull();
    expect(structureFor([], '2026-06')).toBeNull();
  });

  it('reads stored components tolerantly', () => {
    expect(
      parseComponents([
        { name: 'House rent', amountMinor: 100 },
        { name: 'Bad', amountMinor: 'x' },
        null,
      ]),
    ).toEqual([{ name: 'House rent', amountMinor: 100 }]);
    expect(parseComponents(null)).toEqual([]);
  });
});
