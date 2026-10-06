import { lineStatusOf, runStatusAfterPayment } from './line-payment';

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
