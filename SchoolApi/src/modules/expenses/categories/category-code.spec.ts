import { categoryCode } from './category-code';

describe('categoryCode', () => {
  it('derives upper snake case from a name', () => {
    expect(categoryCode('Office supplies')).toBe('OFFICE_SUPPLIES');
    expect(categoryCode('  Repairs & maintenance! ')).toBe(
      'REPAIRS_MAINTENANCE',
    );
    expect(categoryCode('rent')).toBe('RENT');
  });
});
