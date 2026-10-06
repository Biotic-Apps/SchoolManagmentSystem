import {
  receiptNumber,
  receiptSequenceKey,
  receiptYear,
} from './receipt-number';

describe('receipt numbers', () => {
  it('formats RCT-{BRANCH}-{YEAR}-{SEQ} with a 4-digit sequence', () => {
    expect(receiptNumber('MAIN', 2026, 1)).toBe('RCT-MAIN-2026-0001');
    expect(receiptNumber('NORTH', 2027, 123)).toBe('RCT-NORTH-2027-0123');
  });

  it('keeps longer sequences intact', () => {
    expect(receiptNumber('MAIN', 2026, 12345)).toBe('RCT-MAIN-2026-12345');
  });

  it('scopes the sequence per branch and year', () => {
    expect(receiptSequenceKey('b1', 2026)).toBe('receipt:b1:2026');
    expect(receiptSequenceKey('b1', 2026)).not.toBe(
      receiptSequenceKey('b2', 2026),
    );
  });

  it('takes the year of the receipt date, not of today', () => {
    expect(receiptYear(new Date('2025-12-31T00:00:00.000Z'))).toBe(2025);
    expect(receiptYear(new Date('2026-01-01T00:00:00.000Z'))).toBe(2026);
  });
});
