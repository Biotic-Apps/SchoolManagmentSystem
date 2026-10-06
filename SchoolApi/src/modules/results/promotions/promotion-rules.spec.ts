import {
  averagePercentH,
  failedSubjectCount,
  suggestPromotion,
  targetClassId,
} from './promotion-rules';
import { isLastClass, nextClass, resolveTargetSection } from './target-section';

const base = { isLastClass: false, failedSubjects: 0, minPassPercent: 33 };

describe('promotion rules', () => {
  it('promotes at or above the minimum with nothing failed', () => {
    expect(suggestPromotion({ ...base, percentH: 3300 }).decision).toBe(
      'PROMOTE',
    );
    expect(suggestPromotion({ ...base, percentH: 9000 }).decision).toBe(
      'PROMOTE',
    );
  });

  it('is conditional with up to two failed subjects', () => {
    expect(
      suggestPromotion({ ...base, percentH: 6000, failedSubjects: 1 }).decision,
    ).toBe('CONDITIONAL');
    expect(
      suggestPromotion({ ...base, percentH: 6000, failedSubjects: 2 }).decision,
    ).toBe('CONDITIONAL');
    expect(
      suggestPromotion({ ...base, percentH: 6000, failedSubjects: 3 }).decision,
    ).toBe('REPEAT');
  });

  it('repeats below the minimum', () => {
    expect(suggestPromotion({ ...base, percentH: 3299 }).decision).toBe(
      'REPEAT',
    );
    expect(
      suggestPromotion({ ...base, percentH: 1000, failedSubjects: 1 }).decision,
    ).toBe('REPEAT');
  });

  it('graduates the last class only when passed', () => {
    const last = { ...base, isLastClass: true };
    expect(suggestPromotion({ ...last, percentH: 7000 }).decision).toBe(
      'GRADUATE',
    );
    expect(
      suggestPromotion({ ...last, percentH: 7000, failedSubjects: 1 }).decision,
    ).toBe('REPEAT');
    expect(suggestPromotion({ ...last, percentH: 2000 }).decision).toBe(
      'REPEAT',
    );
  });

  it('is conditional with a note when there are no results', () => {
    expect(suggestPromotion({ ...base, percentH: null })).toEqual({
      decision: 'CONDITIONAL',
      note: 'No results for the selected exams',
    });
  });

  it('averages and counts failed subjects', () => {
    expect(averagePercentH([])).toBeNull();
    expect(averagePercentH([5000, 6001])).toBe(5501); // 5500.5 → 5501
    expect(
      failedSubjectCount([
        {
          subjects: [
            { subjectId: 'm', passed: false },
            { subjectId: 'e', passed: true },
          ],
        },
        {
          subjects: [
            { subjectId: 'm', passed: false },
            { subjectId: 's', passed: false },
          ],
        },
      ]),
    ).toBe(2);
  });

  it('maps decisions to target classes', () => {
    expect(targetClassId('PROMOTE', 'c4', 'c5')).toBe('c5');
    expect(targetClassId('CONDITIONAL', 'c4', 'c5')).toBe('c5');
    expect(targetClassId('REPEAT', 'c4', 'c5')).toBe('c4');
    expect(targetClassId('GRADUATE', 'c4', null)).toBeNull();
  });
});

describe('target section', () => {
  const classes = [
    { id: 'c1', levelOrder: 1 },
    { id: 'c3', levelOrder: 3 },
    { id: 'c2', levelOrder: 2 },
  ];
  const sections = [
    { id: 's2b', classId: 'c2', name: 'B' },
    { id: 's2a', classId: 'c2', name: 'A' },
    { id: 's3a', classId: 'c3', name: 'A' },
  ];

  it('finds the next class by level order', () => {
    expect(nextClass(classes, 'c1')?.id).toBe('c2');
    expect(nextClass(classes, 'c3')).toBeNull();
    expect(isLastClass(classes, 'c3')).toBe(true);
    expect(isLastClass(classes, 'c2')).toBe(false);
  });

  it('prefers the chosen section, then the same name, then the first', () => {
    expect(
      resolveTargetSection(sections, {
        classId: 'c2',
        toSectionId: 's2b',
        fromSectionName: 'A',
      })?.id,
    ).toBe('s2b');
    expect(
      resolveTargetSection(sections, {
        classId: 'c2',
        toSectionId: 's3a',
        fromSectionName: 'A',
      }),
    ).toBeNull();
    expect(
      resolveTargetSection(sections, {
        classId: 'c2',
        toSectionId: null,
        fromSectionName: 'b',
      })?.id,
    ).toBe('s2b');
    expect(
      resolveTargetSection(sections, {
        classId: 'c2',
        toSectionId: null,
        fromSectionName: 'Z',
      })?.id,
    ).toBe('s2a');
    expect(
      resolveTargetSection(sections, {
        classId: 'c9',
        toSectionId: null,
        fromSectionName: 'A',
      }),
    ).toBeNull();
  });
});
