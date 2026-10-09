import { fatherName } from './challan-source.service';

const link = (relation: string, name: string, isPrimary = false) => ({
  relation,
  isPrimary,
  guardian: { name },
});

describe('fatherName', () => {
  it('prefers the father, then the primary guardian', () => {
    expect(
      fatherName([link('MOTHER', 'Sana', true), link('FATHER', 'Imran')]),
    ).toBe('Imran');
    expect(
      fatherName([link('GUARDIAN', 'Uncle'), link('MOTHER', 'Sana', true)]),
    ).toBe('Sana');
    expect(fatherName([])).toBeNull();
  });
});
