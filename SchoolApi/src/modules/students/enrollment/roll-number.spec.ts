import { nextRollNo } from './roll-number';

describe('nextRollNo', () => {
  it('starts at 1 in an empty section', () => {
    expect(nextRollNo([])).toBe(1);
  });

  it('takes the next number after a dense sequence', () => {
    expect(nextRollNo([1, 2, 3])).toBe(4);
  });

  it('fills the first gap left by a withdrawn student', () => {
    expect(nextRollNo([1, 2, 4, 5])).toBe(3);
  });

  it('ignores unordered input and missing roll numbers', () => {
    expect(nextRollNo([3, null, 1, 3])).toBe(2);
  });
});
