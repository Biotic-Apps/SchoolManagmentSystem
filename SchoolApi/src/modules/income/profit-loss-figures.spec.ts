import { buildProfitLoss } from './profit-loss-figures';

describe('buildProfitLoss (cash basis)', () => {
  const figures = buildProfitLoss({
    feeReceivedMinor: 950050n,
    feeRefundedMinor: 49950n,
    otherIncome: [{ name: 'Canteen rent', amountMinor: 250025n }],
    expensesPaid: [{ name: 'Utilities', amountMinor: 6234567n }],
    salariesPaidMinor: 9618000n,
    withheldMinor: 287075n,
  });

  it('nets refunds off fee collections', () => {
    expect(figures.lines).toContainEqual({
      section: 'INCOME',
      item: 'Fee refunds paid',
      amountMinor: -49950n,
    });
    expect(figures.totalIncomeMinor).toBe(950050n - 49950n + 250025n);
  });

  it('counts salaries paid plus deductions withheld, not approved net', () => {
    expect(figures.lines).toContainEqual({
      section: 'EXPENSE',
      item: 'Salary deductions withheld (tax, EOBI, other)',
      amountMinor: 287075n,
    });
    expect(figures.totalExpensesMinor).toBe(6234567n + 9618000n + 287075n);
    expect(figures.netMinor).toBe(
      figures.totalIncomeMinor - figures.totalExpensesMinor,
    );
  });

  it('leaves out empty refund and withholding lines', () => {
    const plain = buildProfitLoss({
      feeReceivedMinor: 100n,
      feeRefundedMinor: 0n,
      otherIncome: [],
      expensesPaid: [],
      salariesPaidMinor: 0n,
      withheldMinor: 0n,
    });
    expect(plain.lines.map((l) => l.item)).toEqual([
      'Fee collections',
      'Salaries paid',
    ]);
  });
});
