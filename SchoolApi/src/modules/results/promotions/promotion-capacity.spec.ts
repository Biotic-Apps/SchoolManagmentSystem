import { countBy, overCapacity } from './promotion-capacity';

describe('overCapacity', () => {
  const sections = [
    { id: 'a', capacity: 30 },
    { id: 'b', capacity: null },
    { id: 'c', capacity: 2 },
    { id: 'd', capacity: 5 },
  ];

  it('reports only sections that would overflow', () => {
    const current = new Map([
      ['a', 28],
      ['b', 500],
      ['c', 0],
      ['d', 5],
    ]);
    const incoming = new Map([
      ['a', 2],
      ['b', 40],
      ['c', 3],
    ]);
    expect(overCapacity(sections, current, incoming)).toEqual([
      { sectionId: 'c', capacity: 2, current: 0, incoming: 3 },
    ]);
  });

  it('treats a full section without incoming students as fine', () => {
    expect(overCapacity(sections, new Map([['d', 9]]), new Map())).toEqual([]);
  });

  it('flags exactly one over the limit', () => {
    expect(
      overCapacity(sections, new Map([['a', 30]]), new Map([['a', 1]])),
    ).toEqual([{ sectionId: 'a', capacity: 30, current: 30, incoming: 1 }]);
  });
});

describe('countBy', () => {
  it('counts non-null keys', () => {
    expect([...countBy(['a', null, 'a', 'b'], (x) => x).entries()]).toEqual([
      ['a', 2],
      ['b', 1],
    ]);
  });
});
