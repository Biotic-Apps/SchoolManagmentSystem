import { appliesTo, normalizeGroup } from './curriculum';
import { baseCode, uniqueCode } from './subject-codes';

describe('curriculum helpers', () => {
  it('applies ungrouped subjects everywhere and grouped ones to their group only', () => {
    expect(appliesTo(null, 'Arts')).toBe(true);
    expect(appliesTo('Science', ' science ')).toBe(true);
    expect(appliesTo('Science', 'Arts')).toBe(false);
    expect(appliesTo('Science', null)).toBe(false);
    expect(normalizeGroup('  ')).toBeNull();
  });

  it('uses catalogue codes, initials otherwise, suffixed on clash', () => {
    expect(baseCode('Mathematics')).toBe('MATH');
    expect(baseCode('art & drawing')).toBe('ART');
    expect(baseCode('Pak Studies')).toBe('PS');
    expect(baseCode('Geography')).toBe('GEO');
    const taken = new Set(['PS']);
    expect(uniqueCode('Pak Studies', taken)).toBe('PS2');
    expect(uniqueCode('Public Speaking', taken)).toBe('PS3');
  });
});
