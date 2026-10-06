import { AppError } from '../../core/common/errors/app-error';
import { applyExpensePayment } from './expense-rules';

describe('applyExpensePayment', () => {
  it('marks partial and full settlement', () => {
    expect(applyExpensePayment(1000n, 0n, 400n)).toEqual({
      paidMinor: 400n,
      status: 'PARTIALLY_PAID',
    });
    expect(applyExpensePayment(1000n, 400n, 600n)).toEqual({
      paidMinor: 1000n,
      status: 'PAID',
    });
  });

  it('refuses more than the remaining balance', () => {
    expect(() => applyExpensePayment(1000n, 400n, 601n)).toThrow(AppError);
  });
});
