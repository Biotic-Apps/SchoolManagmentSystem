import { parseDate } from '../../core/common/dates';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { assertExpenseDates } from './expense-refs';

describe('assertExpenseDates', () => {
  const today = parseDate('2026-11-27');

  it('refuses a bill dated in the future', () => {
    let error: unknown;
    try {
      assertExpenseDates(parseDate('2027-05-01'), null, null, today);
    } catch (caught) {
      error = caught;
    }
    expect(error).toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      message: 'billDate cannot be in the future',
    });
  });

  it('accepts today and past bills; unchanged dates are not re-checked', () => {
    expect(() =>
      assertExpenseDates(today, parseDate('2026-12-10'), null, today),
    ).not.toThrow();
    expect(() =>
      assertExpenseDates(parseDate('2027-05-01'), null, null),
    ).not.toThrow();
  });

  it('still requires the due date on or after the bill date', () => {
    expect(() =>
      assertExpenseDates(today, parseDate('2026-11-01'), null, today),
    ).toThrow('dueDate must not be before billDate');
  });
});
