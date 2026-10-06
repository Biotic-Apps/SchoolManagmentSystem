import { mulDivRound } from '../../finance-core/money';

/**
 * collected / billed rounded half-up to 2 decimals (0.87 = 87%). Computed in
 * integer hundredths and divided once for display; 0 when nothing was billed.
 */
export function collectionRate(collected: bigint, billed: bigint): number {
  if (billed <= 0n || collected <= 0n) return 0;
  return Number(mulDivRound(collected, 100n, billed)) / 100;
}
