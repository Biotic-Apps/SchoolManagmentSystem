import { canRefund, refundableMinor } from './refundable';

describe('refundable amount', () => {
  it('is the advance credit minus pending refunds', () => {
    expect(refundableMinor(5000n, 0n)).toBe(5000n);
    expect(refundableMinor(5000n, 2000n)).toBe(3000n);
  });

  it('never goes negative', () => {
    expect(refundableMinor(1000n, 3000n)).toBe(0n);
  });

  it('allows refunds up to the refundable amount', () => {
    expect(canRefund(3000n, 5000n, 2000n)).toBe(true);
    expect(canRefund(3001n, 5000n, 2000n)).toBe(false);
  });

  it('refuses allocated money (no advance) and non-positive amounts', () => {
    expect(canRefund(1n, 0n, 0n)).toBe(false);
    expect(canRefund(0n, 5000n, 0n)).toBe(false);
    expect(canRefund(-5n, 5000n, 0n)).toBe(false);
  });
});
