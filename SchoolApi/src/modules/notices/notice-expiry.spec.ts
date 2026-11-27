import { formatDate, parseDate } from '../../core/common/dates';
import { today } from '../../core/common/week';
import { assertNotExpired, expiryDate } from './notice-expiry';

describe('notice expiry', () => {
  it('rejects an expiry date in the past and keeps today or later', () => {
    expect(() => expiryDate('2026-01-01')).toThrow('cannot be in the past');
    expect(expiryDate(formatDate(today()))).toEqual(today());
    expect(expiryDate(undefined)).toBeUndefined();
  });

  it('refuses to publish a draft that already expired', () => {
    const now = parseDate('2026-11-27');
    expect(() => assertNotExpired(parseDate('2026-11-26'), now)).toThrow(
      'expired on 2026-11-26',
    );
    expect(() => assertNotExpired(parseDate('2026-11-27'), now)).not.toThrow();
    expect(() => assertNotExpired(null, now)).not.toThrow();
  });
});
