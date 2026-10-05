import { isValidAt, type ActiveAssignment } from './active-assignment';

const base = {
  validFrom: '2026-01-01T00:00:00Z',
  validUntil: null,
} as ActiveAssignment;

describe('isValidAt', () => {
  it('respects validFrom and validUntil', () => {
    const at = Date.parse('2026-06-01T00:00:00Z');
    expect(isValidAt(base, at)).toBe(true);
    expect(isValidAt({ ...base, validFrom: '2026-07-01T00:00:00Z' }, at)).toBe(
      false,
    );
    expect(isValidAt({ ...base, validUntil: '2026-05-31T00:00:00Z' }, at)).toBe(
      false,
    );
    expect(isValidAt({ ...base, validUntil: '2026-06-02T00:00:00Z' }, at)).toBe(
      true,
    );
  });
});
