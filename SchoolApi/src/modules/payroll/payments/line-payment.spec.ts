import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import {
  assertNotOwnSalary,
  lineStatusOf,
  runStatusAfterPayment,
} from './line-payment';

describe('salary payment status', () => {
  it('derives line status from paid vs net', () => {
    expect(lineStatusOf(1000n, 0n)).toBe('UNPAID');
    expect(lineStatusOf(1000n, 400n)).toBe('PARTIALLY_PAID');
    expect(lineStatusOf(1000n, 1000n)).toBe('PAID');
    expect(lineStatusOf(0n, 0n)).toBe('PAID');
  });

  it('marks the run PAID only when every line is paid', () => {
    expect(runStatusAfterPayment(['PAID', 'PARTIALLY_PAID'])).toBe(
      'PARTIALLY_PAID',
    );
    expect(runStatusAfterPayment(['PAID', 'PAID'])).toBe('PAID');
  });
});

describe('assertNotOwnSalary', () => {
  it('refuses a payment of the actor’s own salary (403)', () => {
    let error: unknown;
    try {
      assertNotOwnSalary('user-1', 'user-1');
    } catch (caught) {
      error = caught;
    }
    expect(error).toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it('allows other staff and staff without a login', () => {
    expect(() => assertNotOwnSalary('user-2', 'user-1')).not.toThrow();
    expect(() => assertNotOwnSalary(null, 'user-1')).not.toThrow();
  });
});
