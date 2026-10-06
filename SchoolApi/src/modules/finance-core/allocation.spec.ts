import {
  AllocationError,
  planAllocation,
  type OpenInvoice,
} from './allocation';

const day = (d: string) => new Date(`${d}T00:00:00.000Z`);
const inv = (
  id: string,
  due: string,
  balance: number,
  created = '2026-01-01',
): OpenInvoice => ({
  id,
  dueDate: day(due),
  createdAt: day(created),
  balanceMinor: BigInt(balance),
});

describe('planAllocation', () => {
  const open = [
    inv('march', '2026-03-10', 5_000),
    inv('jan', '2026-01-10', 3_000),
    inv('feb', '2026-02-10', 4_000),
  ];

  it('settles the oldest due invoice first', () => {
    const plan = planAllocation(open, 6_000n);
    expect(plan.allocations).toEqual([
      { invoiceId: 'jan', amountMinor: 3_000n },
      { invoiceId: 'feb', amountMinor: 3_000n },
    ]);
    expect(plan.advanceMinor).toBe(0n);
  });

  it('allows a partial payment of the oldest invoice', () => {
    const plan = planAllocation(open, 1_000n);
    expect(plan.allocations).toEqual([
      { invoiceId: 'jan', amountMinor: 1_000n },
    ]);
    expect(plan.advanceMinor).toBe(0n);
  });

  it('keeps overpayment as advance credit', () => {
    const plan = planAllocation(open, 15_000n);
    expect(plan.allocations.map((a) => a.amountMinor)).toEqual([
      3_000n,
      4_000n,
      5_000n,
    ]);
    expect(plan.advanceMinor).toBe(3_000n);
  });

  it('is pure advance when nothing is open', () => {
    expect(planAllocation([], 2_500n)).toEqual({
      allocations: [],
      advanceMinor: 2_500n,
    });
  });

  it('skips settled invoices and breaks due-date ties by creation', () => {
    const plan = planAllocation(
      [
        inv('b', '2026-01-10', 100, '2026-01-02'),
        inv('paid', '2025-12-10', 0),
        inv('a', '2026-01-10', 100, '2026-01-01'),
      ],
      150n,
    );
    expect(plan.allocations).toEqual([
      { invoiceId: 'a', amountMinor: 100n },
      { invoiceId: 'b', amountMinor: 50n },
    ]);
  });

  it('honours explicit allocations and keeps the rest as advance', () => {
    const plan = planAllocation(open, 6_000n, [
      { invoiceId: 'march', amountMinor: 5_000n },
    ]);
    expect(plan).toEqual({
      allocations: [{ invoiceId: 'march', amountMinor: 5_000n }],
      advanceMinor: 1_000n,
    });
  });

  it.each([
    ['above the invoice balance', [{ invoiceId: 'jan', amountMinor: 3_001n }]],
    [
      'above the payment',
      [
        { invoiceId: 'march', amountMinor: 5_000n },
        { invoiceId: 'feb', amountMinor: 4_000n },
      ],
    ],
    ['unknown invoice', [{ invoiceId: 'other', amountMinor: 1n }]],
    [
      'duplicate invoice',
      [
        { invoiceId: 'jan', amountMinor: 1n },
        { invoiceId: 'jan', amountMinor: 1n },
      ],
    ],
    ['zero amount', [{ invoiceId: 'jan', amountMinor: 0n }]],
  ])('rejects explicit allocations %s', (_label, explicit) => {
    expect(() => planAllocation(open, 6_000n, explicit)).toThrow(
      AllocationError,
    );
  });

  it('rejects non-positive payments', () => {
    expect(() => planAllocation(open, 0n)).toThrow(AllocationError);
  });
});
