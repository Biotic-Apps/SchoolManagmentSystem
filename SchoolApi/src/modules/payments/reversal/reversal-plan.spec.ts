import { planReversal, ReversalPlanError } from './reversal-plan';

const payment = (amount: number, unallocated: number) => ({
  id: 'p1',
  schoolId: 's1',
  branchId: 'b1',
  studentId: 'st1',
  amountMinor: BigInt(amount),
  unallocatedMinor: BigInt(unallocated),
});
const original = { entryId: 'e1', reason: 'Bounced cheque', actorId: 'u1' };

describe('planReversal', () => {
  it('posts one positive REVERSAL entry against the original PAYMENT entry', () => {
    const plan = planReversal(
      payment(5000, 0),
      [{ invoiceId: 'i1', amountMinor: 5000n, reversed: false }],
      original,
    );
    expect(plan.postings).toEqual([
      expect.objectContaining({
        type: 'REVERSAL',
        amountMinor: 5000n,
        reversesId: 'e1',
        reason: 'Bounced cheque',
        refType: 'Payment',
        refId: 'p1',
        paymentId: 'p1',
        studentId: 'st1',
      }),
    ]);
    expect(plan.unallocatedAfter).toBe(0n);
  });

  it('reopens every invoice the payment settled, including advance spent later', () => {
    const plan = planReversal(
      payment(10000, 1000),
      [
        { invoiceId: 'i1', amountMinor: 6000n, reversed: false },
        { invoiceId: 'i2', amountMinor: 2000n, reversed: false },
        { invoiceId: 'i2', amountMinor: 1000n, reversed: false },
      ],
      original,
    );
    expect(plan.invoiceDeltas).toEqual(
      new Map([
        ['i1', -6000n],
        ['i2', -3000n],
      ]),
    );
    expect(plan.postings[0].amountMinor).toBe(10000n);
  });

  it('reverses a pure advance payment (no invoices)', () => {
    const plan = planReversal(payment(2500, 2500), [], original);
    expect(plan.invoiceDeltas.size).toBe(0);
    expect(plan.postings[0].amountMinor).toBe(2500n);
  });

  it('ignores allocations that were already released', () => {
    const plan = planReversal(
      payment(3000, 0),
      [
        { invoiceId: 'i1', amountMinor: 3000n, reversed: true },
        { invoiceId: 'i2', amountMinor: 3000n, reversed: false },
      ],
      original,
    );
    expect([...plan.invoiceDeltas.keys()]).toEqual(['i2']);
  });

  it('refuses a payment whose parts do not add up (e.g. refunded)', () => {
    expect(() =>
      planReversal(
        payment(5000, 500),
        [{ invoiceId: 'i1', amountMinor: 4000n, reversed: false }],
        original,
      ),
    ).toThrow(ReversalPlanError);
  });
});
