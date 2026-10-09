import { formatMinor } from '../../finance-core/money';

export interface PaymentReceivedFacts {
  studentName: string;
  amountMinor: bigint;
  currency: string;
  receiptNo: string;
  /** Student ledger balance after the payment (negative = advance credit). */
  balanceMinor: bigint;
}

/** Fee-received alert to guardians (in-app, push and SMS share the text). */
export function paymentReceivedMessage(facts: PaymentReceivedFacts): {
  title: string;
  body: string;
} {
  const money = (value: bigint) => formatMinor(value, facts.currency);
  const balance =
    facts.balanceMinor > 0n
      ? `Remaining balance ${money(facts.balanceMinor)}.`
      : facts.balanceMinor < 0n
        ? `No dues left; advance credit ${money(-facts.balanceMinor)}.`
        : 'No dues left.';
  return {
    title: 'Fee payment received',
    body: `${money(facts.amountMinor)} received for ${facts.studentName}. Receipt ${facts.receiptNo}. ${balance}`,
  };
}
