import { applyConcessions, type ConcessionRule } from './concession-math';

const lines = [
  { feeHeadId: 'tuition', amountMinor: 10_000n },
  { feeHeadId: 'transport', amountMinor: 3_333n },
];
const rule = (
  id: string,
  type: 'PERCENT' | 'FIXED',
  value: bigint,
  feeHeadId: string | null = null,
): ConcessionRule => ({ id, type, value, feeHeadId });

describe('applyConcessions', () => {
  it('takes a percent of the whole invoice', () => {
    expect(applyConcessions(lines, [rule('c', 'PERCENT', 10n)])).toEqual([
      { concessionId: 'c', amountMinor: 1_333n },
    ]);
  });

  it('rounds percent shares half-up', () => {
    // 3333 × 50% = 1666.5 → 1667
    expect(
      applyConcessions(lines, [rule('c', 'PERCENT', 50n, 'transport')]),
    ).toEqual([{ concessionId: 'c', amountMinor: 1_667n }]);
    // 3333 × 15% = 499.95 → 500 ; 10000 × 1% exact
    expect(
      applyConcessions(lines, [rule('c', 'PERCENT', 15n, 'transport')])[0]
        .amountMinor,
    ).toBe(500n);
  });

  it('applies a fee-head rule only to that head', () => {
    expect(
      applyConcessions(lines, [rule('c', 'PERCENT', 100n, 'tuition')]),
    ).toEqual([{ concessionId: 'c', amountMinor: 10_000n }]);
  });

  it('caps FIXED at the applicable amount', () => {
    expect(
      applyConcessions(lines, [rule('c', 'FIXED', 5_000n, 'transport')]),
    ).toEqual([{ concessionId: 'c', amountMinor: 3_333n }]);
    expect(applyConcessions(lines, [rule('c', 'FIXED', 2_000n)])).toEqual([
      { concessionId: 'c', amountMinor: 2_000n },
    ]);
  });

  it('never exceeds the subtotal across rules', () => {
    const applied = applyConcessions(lines, [
      rule('whole', 'PERCENT', 80n),
      rule('head', 'PERCENT', 100n, 'tuition'),
      rule('fixed', 'FIXED', 9_000n),
    ]);
    // head first (10000), then 80% of 13333 = 10666 capped at 3333, then 0 left
    expect(applied).toEqual([
      { concessionId: 'head', amountMinor: 10_000n },
      { concessionId: 'whole', amountMinor: 3_333n },
    ]);
  });

  it('never exceeds what is left of a head', () => {
    const applied = applyConcessions(lines, [
      rule('a', 'PERCENT', 60n, 'tuition'),
      rule('b', 'PERCENT', 60n, 'tuition'),
    ]);
    expect(applied.map((a) => a.amountMinor)).toEqual([6_000n, 4_000n]);
  });

  it('gives nothing for a head that is not billed', () => {
    expect(applyConcessions(lines, [rule('c', 'FIXED', 500n, 'exam')])).toEqual(
      [],
    );
    expect(applyConcessions([], [rule('c', 'PERCENT', 50n)])).toEqual([]);
  });
});
