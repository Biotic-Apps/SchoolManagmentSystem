import { paymentReceivedMessage } from './payment-received-message';

const facts = {
  studentName: 'Ali Khan',
  amountMinor: 500_000n,
  currency: 'PKR',
  receiptNo: 'RCT-MAIN-2026-0001',
  balanceMinor: 250_000n,
};

describe('paymentReceivedMessage', () => {
  it('states the amount, receipt and remaining balance', () => {
    expect(paymentReceivedMessage(facts)).toEqual({
      title: 'Fee payment received',
      body: 'PKR 5,000.00 received for Ali Khan. Receipt RCT-MAIN-2026-0001. Remaining balance PKR 2,500.00.',
    });
  });

  it('says when nothing is left to pay', () => {
    expect(paymentReceivedMessage({ ...facts, balanceMinor: 0n }).body).toMatch(
      /No dues left\.$/,
    );
  });

  it('mentions advance credit when the ledger is negative', () => {
    expect(
      paymentReceivedMessage({ ...facts, balanceMinor: -10_000n }).body,
    ).toMatch(/advance credit PKR 100\.00\.$/);
  });
});
