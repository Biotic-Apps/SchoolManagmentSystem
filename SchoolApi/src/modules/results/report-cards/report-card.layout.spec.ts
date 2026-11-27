import { gradingScaleLine, reportCardHeader } from './report-card.layout';

describe('reportCardHeader', () => {
  const base = { schoolName: 'QA Test School', branchLine: 'Main · Street 1' };

  it('uses the school name and branch line without a template', () => {
    expect(reportCardHeader({ ...base, customHeaderOverrides: null })).toEqual({
      schoolName: 'QA Test School',
      branchLine: 'Main · Street 1',
    });
  });

  it('falls back when the school name override is blank', () => {
    expect(
      reportCardHeader({
        ...base,
        customHeaderOverrides: { showLogo: true, schoolName: '   ' },
      }),
    ).toEqual({ schoolName: 'QA Test School', branchLine: 'Main · Street 1' });
  });

  it('applies filled overrides', () => {
    expect(
      reportCardHeader({
        ...base,
        customHeaderOverrides: {
          schoolName: 'QA Academy',
          subtitle: 'Junior wing',
          phone: ' ',
        },
      }),
    ).toEqual({ schoolName: 'QA Academy', branchLine: 'Junior wing' });
  });
});

describe('gradingScaleLine', () => {
  it('lists bands highest first', () => {
    expect(
      gradingScaleLine([
        { grade: 'F', minPercent: 0, maxPercent: 39 },
        { grade: 'A', minPercent: 80, maxPercent: 100 },
        { grade: 'B', minPercent: 40, maxPercent: 79 },
      ]),
    ).toBe('Grading scale: A 80–100% · B 40–79% · F 0–39%');
  });

  it('is empty without bands', () => {
    expect(gradingScaleLine([])).toBe('');
  });
});
