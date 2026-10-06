import { formatNumber } from '../../../core/sequences/sequence.service';

/** Receipt numbers run per branch and calendar year of the receipt date. */
export const receiptSequenceKey = (branchId: string, year: number): string =>
  `receipt:${branchId}:${year}`;

/** `RCT-{BRANCH_CODE}-{YEAR}-{SEQ}` (SEQ padded to 4 digits). */
export const receiptNumber = (
  branchCode: string,
  year: number,
  seq: number,
): string => formatNumber(`RCT-${branchCode}`, year, seq);

/** Year of a date-only value (UTC midnight). */
export const receiptYear = (receivedOn: Date): number =>
  receivedOn.getUTCFullYear();
