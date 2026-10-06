import { checkClearance, needsClearance } from './clearance';

describe('checkClearance', () => {
  const none = {
    ledgerBalanceMinor: 0n,
    openInvoiceBalances: [],
    movements: [],
  };

  it('clears a student with nothing owed or held', () => {
    expect(checkClearance(none)).toEqual({
      cleared: true,
      outstandingMinor: 0n,
      items: [],
    });
  });

  it('blocks on a positive ledger balance', () => {
    const result = checkClearance({ ...none, ledgerBalanceMinor: 1500n });
    expect(result.cleared).toBe(false);
    expect(result.outstandingMinor).toBe(1500n);
  });

  it('ignores advance credit but blocks on open invoice balances', () => {
    const result = checkClearance({
      ...none,
      ledgerBalanceMinor: -500n,
      openInvoiceBalances: [200n, 300n, 0n],
    });
    expect(result.cleared).toBe(false);
    expect(result.outstandingMinor).toBe(500n);
  });

  it('lists unreturned non-saleable items only', () => {
    const result = checkClearance({
      ...none,
      movements: [
        { itemId: 'b', name: 'Library book', saleable: false, quantity: -2 },
        { itemId: 'b', name: 'Library book', saleable: false, quantity: 1 },
        { itemId: 'u', name: 'Uniform', saleable: true, quantity: -3 },
        { itemId: 'l', name: 'Laptop', saleable: false, quantity: -1 },
        { itemId: 'l', name: 'Laptop', saleable: false, quantity: 1 },
      ],
    });
    expect(result.cleared).toBe(false);
    expect(result.items).toEqual([
      { itemId: 'b', name: 'Library book', quantity: 1 },
    ]);
  });

  it('applies to leaving and transfer certificates only', () => {
    expect(needsClearance('SCHOOL_LEAVING')).toBe(true);
    expect(needsClearance('TRANSFER')).toBe(true);
    expect(needsClearance('CHARACTER')).toBe(false);
  });
});
