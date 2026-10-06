import { collectionRate } from './collection-rate';

describe('collectionRate', () => {
  it('is collected / billed with 2 decimals', () => {
    expect(collectionRate(87000n, 100000n)).toBe(0.87);
    expect(collectionRate(100000n, 100000n)).toBe(1);
  });

  it('rounds half up', () => {
    expect(collectionRate(1n, 3n)).toBe(0.33);
    expect(collectionRate(2n, 3n)).toBe(0.67);
    expect(collectionRate(1005n, 100000n)).toBe(0.01);
  });

  it('may exceed 1 when old dues are collected', () => {
    expect(collectionRate(150000n, 100000n)).toBe(1.5);
  });

  it('is 0 when nothing was billed or collected', () => {
    expect(collectionRate(5000n, 0n)).toBe(0);
    expect(collectionRate(0n, 5000n)).toBe(0);
  });
});
