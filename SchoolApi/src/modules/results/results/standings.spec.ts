import { ordinal, positionText, standingsOf } from './standings';

describe('standingsOf', () => {
  it('ranks across sections of a class and counts section sizes', () => {
    const map = standingsOf([
      { studentId: 'a', sectionId: 'A', classId: 'c5', percentH: 9000 },
      { studentId: 'b', sectionId: 'A', classId: 'c5', percentH: 7000 },
      { studentId: 'c', sectionId: 'B', classId: 'c5', percentH: 9000 },
      { studentId: 'd', sectionId: 'B', classId: 'c5', percentH: 8000 },
      { studentId: 'e', sectionId: 'B', classId: 'c5', percentH: 6000 },
      { studentId: 'x', sectionId: 'X', classId: 'c6', percentH: 5000 },
    ]);
    expect(map.get('a')).toEqual({
      sectionSize: 2,
      classPosition: 1,
      classSize: 5,
    });
    expect(map.get('c')?.classPosition).toBe(1);
    expect(map.get('d')?.classPosition).toBe(3);
    expect(map.get('b')?.classPosition).toBe(4);
    expect(map.get('e')).toEqual({
      sectionSize: 3,
      classPosition: 5,
      classSize: 5,
    });
    expect(map.get('x')).toEqual({
      sectionSize: 1,
      classPosition: 1,
      classSize: 1,
    });
  });

  it('is empty for no rows', () => {
    expect(standingsOf([]).size).toBe(0);
  });
});

describe('position text', () => {
  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
    [22, '22nd'],
    [103, '103rd'],
  ])('ordinal(%i) = %s', (n, text) => expect(ordinal(n)).toBe(text));

  it('shows rank of size, or a dash when positions are off', () => {
    expect(positionText(3, 32)).toBe('3rd of 32');
    expect(positionText(null, 32)).toBe('-');
  });
});
