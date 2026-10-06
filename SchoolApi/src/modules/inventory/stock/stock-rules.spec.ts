import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { applyMovement, signedQuantity, validateMovement } from './stock-rules';

const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (error) {
    return (error as AppError).code;
  }
  return undefined;
};

describe('stock rules', () => {
  it('signs quantities by movement type', () => {
    expect(signedQuantity('IN', 5)).toBe(5);
    expect(signedQuantity('TRANSFER_IN', 5)).toBe(5);
    expect(signedQuantity('ISSUE', 5)).toBe(-5);
    expect(signedQuantity('TRANSFER_OUT', 5)).toBe(-5);
    expect(signedQuantity('ADJUST', -3)).toBe(-3);
    expect(signedQuantity('ADJUST', 3)).toBe(3);
  });

  it('rejects zero, fractional and negative non-adjust quantities', () => {
    expect(() => signedQuantity('IN', 0)).toThrow(AppError);
    expect(() => signedQuantity('ISSUE', -2)).toThrow(AppError);
    expect(() => signedQuantity('ADJUST', 1.5)).toThrow(AppError);
  });

  it('never lets stock go negative', () => {
    expect(applyMovement(10, -10)).toBe(0);
    expect(applyMovement(0, 4)).toBe(4);
    expect(codeOf(() => applyMovement(3, -4))).toBe(ErrorCode.NEGATIVE_STOCK);
  });

  it('applies issue, transfer and adjust against the stock', () => {
    let stock = applyMovement(0, signedQuantity('IN', 10));
    stock = applyMovement(stock, signedQuantity('TRANSFER_OUT', 6));
    expect(stock).toBe(4);
    expect(
      codeOf(() => applyMovement(stock, signedQuantity('TRANSFER_OUT', 5))),
    ).toBe(ErrorCode.NEGATIVE_STOCK);
    expect(
      codeOf(() => applyMovement(stock, signedQuantity('ADJUST', -5))),
    ).toBe(ErrorCode.NEGATIVE_STOCK);
    expect(applyMovement(stock, signedQuantity('ADJUST', -4))).toBe(0);
  });

  it('validates adjust reasons and transfer targets', () => {
    const base = { branchId: 'a', quantity: 1 };
    expect(codeOf(() => validateMovement({ ...base, type: 'ADJUST' }))).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
    expect(() =>
      validateMovement({ ...base, type: 'ADJUST', reason: 'count' }),
    ).not.toThrow();
    expect(
      codeOf(() => validateMovement({ ...base, type: 'TRANSFER_OUT' })),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(
      codeOf(() =>
        validateMovement({ ...base, type: 'TRANSFER_OUT', toBranchId: 'a' }),
      ),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(
      codeOf(() => validateMovement({ ...base, type: 'TRANSFER_IN' })),
    ).toBe(ErrorCode.VALIDATION_FAILED);
  });
});
