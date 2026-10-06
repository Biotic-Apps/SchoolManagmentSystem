import { findReport } from './report-catalog';
import { validateParams } from './report-params';

const BRANCH = '0193a6f0-1111-7aaa-8bbb-123456789abc';

describe('validateParams', () => {
  const collection = findReport('fees.collection')!;
  const defaulters = findReport('fees.defaulters')!;

  it('keeps declared params only', () => {
    expect(
      validateParams(collection, {
        branchId: BRANCH,
        from: '2026-01-01',
        to: '2026-01-31',
        extra: 'x',
      }),
    ).toEqual({ branchId: BRANCH, from: '2026-01-01', to: '2026-01-31' });
  });

  it('rejects missing, malformed and reversed values', () => {
    expect(() => validateParams(collection, { branchId: BRANCH })).toThrow(
      'from is required',
    );
    expect(() =>
      validateParams(collection, {
        branchId: 'nope',
        from: '2026-01-01',
        to: '2026-01-02',
      }),
    ).toThrow('branchId must be a valid uuid');
    expect(() =>
      validateParams(collection, {
        branchId: BRANCH,
        from: '2026-02-01',
        to: '2026-01-01',
      }),
    ).toThrow('from must not be after to');
  });

  it('parses optional integers', () => {
    expect(
      validateParams(defaulters, { branchId: BRANCH, minDays: '30' }),
    ).toEqual({ branchId: BRANCH, minDays: 30 });
    expect(() =>
      validateParams(defaulters, { branchId: BRANCH, minDays: 1.5 }),
    ).toThrow('minDays must be a whole number');
  });
});
