import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { nextTransition } from './approval-transition';

const steps = (...limits: (number | null)[]) =>
  limits.map((limit, i) => ({
    order: i + 1,
    amountLimitMinor: limit === null ? null : BigInt(limit),
  }));

describe('nextTransition', () => {
  it('rejects and returns immediately', () => {
    expect(nextTransition(steps(null, null), 1, 'REJECTED', null)).toEqual({
      status: 'REJECTED',
      currentStep: 1,
    });
    expect(nextTransition(steps(null), 1, 'RETURNED', null)).toEqual({
      status: 'RETURNED',
      currentStep: 1,
    });
  });

  it('walks unlimited steps in order', () => {
    expect(nextTransition(steps(null, null), 1, 'APPROVED', null)).toEqual({
      status: 'PENDING',
      currentStep: 2,
    });
    expect(nextTransition(steps(null, null), 2, 'APPROVED', null)).toEqual({
      status: 'APPROVED',
      currentStep: 2,
    });
  });

  it('finishes at a limited step when the amount is within the limit', () => {
    expect(nextTransition(steps(10_000, null), 1, 'APPROVED', 5_000n)).toEqual({
      status: 'APPROVED',
      currentStep: 1,
    });
  });

  it('escalates above the limit', () => {
    expect(nextTransition(steps(10_000, null), 1, 'APPROVED', 50_000n)).toEqual(
      { status: 'PENDING', currentStep: 2 },
    );
  });

  it('refuses above the limit with nobody higher', () => {
    expect(() => nextTransition(steps(10_000), 1, 'APPROVED', 50_000n)).toThrow(
      AppError,
    );
    try {
      nextTransition(steps(10_000), 1, 'APPROVED', 50_000n);
    } catch (error) {
      expect((error as AppError).code).toBe(ErrorCode.APPROVAL_REQUIRED);
    }
  });
});
