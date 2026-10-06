import { AppError } from '../../../core/common/errors/app-error';
import { priceSaleLines } from './sale-lines';

const items = new Map([
  ['b', { id: 'b', name: 'Shirt', saleable: true, salePriceMinor: 120000n }],
  ['a', { id: 'a', name: 'Book', saleable: true, salePriceMinor: 45050n }],
  ['c', { id: 'c', name: 'Desk', saleable: false, salePriceMinor: null }],
]);

describe('priceSaleLines', () => {
  it('prices quantity × sale price and orders by item id', () => {
    const lines = priceSaleLines(items, [
      { itemId: 'b', quantity: 2 },
      { itemId: 'a', quantity: 3 },
    ]);
    expect(lines.map((l) => l.item.id)).toEqual(['a', 'b']);
    expect(lines[0].amountMinor).toBe(135150n);
    expect(lines[1].amountMinor).toBe(240000n);
    expect(lines[1].description).toBe('Shirt x 2');
  });

  it('refuses items that are not for sale', () => {
    expect(() => priceSaleLines(items, [{ itemId: 'c', quantity: 1 }])).toThrow(
      AppError,
    );
  });
});
