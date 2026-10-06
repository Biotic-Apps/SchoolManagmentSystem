import { selectPrunable, type RetainedBackup } from './retention-policy';

const at = (iso: string, id = iso): RetainedBackup => ({
  id,
  startedAt: new Date(iso),
});

const now = new Date('2026-10-06T03:00:00Z');

describe('selectPrunable', () => {
  it('keeps the newest backup of the last N days', () => {
    const backups = [
      at('2026-10-06T02:00:00Z'),
      at('2026-10-05T02:00:00Z'),
      at('2026-10-04T02:00:00Z'),
      at('2026-10-03T02:00:00Z'),
    ];
    expect(selectPrunable(backups, { daily: 2, monthly: 0 }, now)).toEqual([
      '2026-10-04T02:00:00Z',
      '2026-10-03T02:00:00Z',
    ]);
  });

  it('prunes older backups of the same day', () => {
    const backups = [
      at('2026-10-06T02:00:00Z'),
      at('2026-10-06T01:00:00Z'),
      at('2026-10-05T02:00:00Z'),
    ];
    expect(selectPrunable(backups, { daily: 5, monthly: 0 }, now)).toEqual([
      '2026-10-06T01:00:00Z',
    ]);
  });

  it('keeps the newest backup of each of the last M months', () => {
    const backups = [
      at('2026-10-06T02:00:00Z'),
      at('2026-10-01T02:00:00Z'),
      at('2026-09-30T02:00:00Z'),
      at('2026-09-01T02:00:00Z'),
      at('2026-08-31T02:00:00Z'),
      at('2026-07-31T02:00:00Z'),
    ];
    expect(selectPrunable(backups, { daily: 1, monthly: 3 }, now)).toEqual([
      '2026-10-01T02:00:00Z',
      '2026-09-01T02:00:00Z',
      '2026-07-31T02:00:00Z',
    ]);
  });

  it('handles month windows across a year boundary', () => {
    const jan = new Date('2027-01-10T00:00:00Z');
    const backups = [
      at('2027-01-09T02:00:00Z'),
      at('2026-12-15T02:00:00Z'),
      at('2026-11-15T02:00:00Z'),
    ];
    expect(selectPrunable(backups, { daily: 1, monthly: 2 }, jan)).toEqual([
      '2026-11-15T02:00:00Z',
    ]);
  });

  it('always keeps the newest backup and accepts an empty list', () => {
    expect(selectPrunable([], { daily: 1, monthly: 0 }, now)).toEqual([]);
    expect(
      selectPrunable(
        [at('2020-01-01T00:00:00Z')],
        { daily: 0, monthly: 0 },
        now,
      ),
    ).toEqual([]);
  });
});
