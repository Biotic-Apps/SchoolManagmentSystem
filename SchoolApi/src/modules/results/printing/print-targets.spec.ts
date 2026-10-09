import { printTargets, type PrintSection } from './print-targets';

const sections: PrintSection[] = [
  { id: 's5a', classId: 'c5', name: 'A', readable: true },
  { id: 's5b', classId: 'c5', name: 'B', readable: false },
  { id: 's6a', classId: 'c6', name: 'A', readable: true },
];

describe('printTargets', () => {
  it('prints one readable section', () => {
    expect(printTargets(['c5', 'c6'], sections, { sectionId: 's5a' })).toEqual({
      ok: true,
      sectionIds: ['s5a'],
      classIds: ['c5'],
    });
  });

  it('forbids naming a section outside the scope', () => {
    expect(printTargets(['c5'], sections, { sectionId: 's5b' })).toMatchObject({
      ok: false,
      reason: 'forbidden',
    });
  });

  it('rejects sections and classes that do not sit the exam', () => {
    expect(printTargets(['c5'], sections, { sectionId: 'nope' })).toMatchObject(
      { ok: false, reason: 'invalid' },
    );
    expect(printTargets(['c5'], sections, { classId: 'c9' })).toMatchObject({
      ok: false,
      reason: 'invalid',
    });
  });

  it('keeps only readable sections of a class', () => {
    expect(printTargets(['c5', 'c6'], sections, { classId: 'c5' })).toEqual({
      ok: true,
      sectionIds: ['s5a'],
      classIds: ['c5'],
    });
  });

  it('defaults to every exam class the caller reaches', () => {
    expect(printTargets(['c5', 'c6'], sections, {})).toEqual({
      ok: true,
      sectionIds: ['s5a', 's6a'],
      classIds: ['c5', 'c6'],
    });
  });

  it('is forbidden when no section is readable', () => {
    expect(
      printTargets(['c5'], [{ ...sections[1] }], { classId: 'c5' }),
    ).toMatchObject({ ok: false, reason: 'forbidden' });
  });
});
