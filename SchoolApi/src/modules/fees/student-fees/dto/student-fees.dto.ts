import type { LedgerEntryType } from '../../../../generated/prisma/client';

export class LedgerEntryDto {
  id!: string;
  /** `YYYY-MM-DD` (school time) of the posting. */
  date!: string;
  createdAt!: string;
  type!: LedgerEntryType;
  description!: string;
  refType!: string;
  refId!: string;
  /** Signed: positive = owed, negative = credit. */
  amountMinor!: number;
  /** Running balance after this entry. */
  balanceMinor!: number;
  invoiceId!: string | null;
  invoiceNo!: string | null;
  paymentId!: string | null;
  receiptNo!: string | null;
  reason!: string | null;
}

export class StudentLedgerDto {
  studentId!: string;
  entries!: LedgerEntryDto[];
  /** Negative = advance credit. */
  balanceMinor!: number;
  currency!: string;
}

export class LastPaymentDto {
  paymentId!: string;
  receiptNo!: string;
  amountMinor!: number;
  paidOn!: string;
}

export class NextDueDto {
  invoiceId!: string;
  invoiceNo!: string;
  dueDate!: string;
  balanceMinor!: number;
}

export class FeeSummaryDto {
  /** Sum of open invoice balances. */
  totalDueMinor!: number;
  /** Open balances past their due date. */
  overdueMinor!: number;
  /** Unallocated parts of recorded payments. */
  advanceMinor!: number;
  /** Ledger balance (negative = credit). */
  balanceMinor!: number;
  lastPayment!: LastPaymentDto | null;
  nextDue!: NextDueDto | null;
  currency!: string;
  onlineGatewayEnabled!: boolean;
  proofUploadEnabled!: boolean;
}
