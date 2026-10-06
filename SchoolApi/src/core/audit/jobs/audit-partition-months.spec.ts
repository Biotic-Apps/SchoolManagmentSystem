import { partitionMonths } from './audit-partition-months';

describe('partitionMonths', () => {
  it('returns the current UTC month and the next two', () => {
    expect(partitionMonths(new Date('2026-10-31T23:30:00Z'))).toEqual([
      '2026-10-01',
      '2026-11-01',
      '2026-12-01',
    ]);
  });

  it('rolls over the year', () => {
    expect(partitionMonths(new Date('2026-12-15T00:00:00Z'), 1)).toEqual([
      '2026-12-01',
      '2027-01-01',
    ]);
  });
});
