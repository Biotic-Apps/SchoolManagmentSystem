import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import {
  assertUniqueItems,
  orderTotal,
  planReceipt,
  receivedTotal,
} from './po-math';

const lines = [
  { itemId: 'a', quantity: 10, unitPriceMinor: 250n, receivedQty: 4 },
  { itemId: 'b', quantity: 3, unitPriceMinor: 1999n, receivedQty: 0 },
];

const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    return (error as AppError).code;
  }
  return undefined;
};

describe('purchase order math', () => {
  it('totals ordered and received amounts in minor units', () => {
    expect(orderTotal(lines)).toBe(10n * 250n + 3n * 1999n);
    expect(receivedTotal(lines)).toBe(4n * 250n);
    expect(orderTotal([])).toBe(0n);
  });

  it('accepts partial receipts within the remaining quantity', () => {
    const plan = planReceipt(lines, [{ itemId: 'a', quantity: 6 }]);
    expect(plan.received.get('a')).toBe(6);
    expect(plan.status).toBe('PARTIALLY_RECEIVED');
  });

  it('completes the order when every line is fully received', () => {
    const plan = planReceipt(lines, [
      { itemId: 'a', quantity: 6 },
      { itemId: 'b', quantity: 3 },
    ]);
    expect(plan.status).toBe('RECEIVED');
  });

  it('refuses more than the remaining quantity (409)', () => {
    expect(
      codeOf(() => planReceipt(lines, [{ itemId: 'a', quantity: 7 }])),
    ).toBe(ErrorCode.CONFLICT);
  });

  it('refuses unknown, duplicate and empty receipts (400)', () => {
    expect(
      codeOf(() => planReceipt(lines, [{ itemId: 'x', quantity: 1 }])),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(
      codeOf(() =>
        planReceipt(lines, [
          { itemId: 'b', quantity: 1 },
          { itemId: 'b', quantity: 1 },
        ]),
      ),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(
      codeOf(() => planReceipt(lines, [{ itemId: 'b', quantity: 0 }])),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(() => assertUniqueItems([{ itemId: 'a' }, { itemId: 'a' }])).toThrow(
      AppError,
    );
  });
});
