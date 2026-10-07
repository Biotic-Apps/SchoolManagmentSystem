import { resolveCalendarRange } from './calendar-range';

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe('resolveCalendarRange', () => {
  it('defaults to today .. today + 90 days', () => {
    const range = resolveCalendarRange('2026-10-07');
    expect(iso(range.from)).toBe('2026-10-07');
    expect(iso(range.to)).toBe('2027-01-05');
  });

  it('counts the default window from a given from', () => {
    const range = resolveCalendarRange('2026-10-07', '2026-12-01');
    expect(iso(range.to)).toBe('2027-03-01');
  });

  it('keeps an explicit range', () => {
    const range = resolveCalendarRange(
      '2026-10-07',
      '2026-01-01',
      '2026-12-31',
    );
    expect(iso(range.from)).toBe('2026-01-01');
    expect(iso(range.to)).toBe('2026-12-31');
  });

  it('allows exactly 366 days and refuses more', () => {
    expect(() =>
      resolveCalendarRange('2026-10-07', '2027-01-01', '2028-01-02'),
    ).not.toThrow();
    expect(() =>
      resolveCalendarRange('2026-10-07', '2027-01-01', '2028-01-03'),
    ).toThrow('Range is limited to 366 days');
  });

  it('refuses to before from', () => {
    expect(() =>
      resolveCalendarRange('2026-10-07', '2026-10-10', '2026-10-09'),
    ).toThrow('to must be on or after from');
  });
});
