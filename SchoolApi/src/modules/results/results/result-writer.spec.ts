import { pendingLine } from './result-writer';

describe('pendingLine', () => {
  it('names the student, section and subjects instead of ids', () => {
    expect(
      pendingLine('Bilal Yousaf', 'Grade 1 A ', [
        { name: 'Urdu' },
        { name: 'Maths' },
      ]),
    ).toBe('Bilal Yousaf (Grade 1 A · Urdu, Maths)');
  });
});
