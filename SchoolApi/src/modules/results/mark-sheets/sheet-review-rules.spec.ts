import {
  describePending,
  reopenProblem,
  reviewProblem,
  type ReviewInput,
} from './sheet-review-rules';

const base: ReviewInput = {
  sheetStatus: 'SUBMITTED',
  examStatus: 'MARKS_OPEN',
  decision: 'ACCEPTED',
  pendingNames: [],
};

describe('reviewProblem', () => {
  it('accepts a complete submitted sheet', () => {
    expect(reviewProblem(base)).toBeNull();
  });

  it('refuses to accept while a student is pending (enrolled after submit)', () => {
    expect(reviewProblem({ ...base, pendingNames: ['Bilal Yousaf'] })).toMatch(
      /Marks are missing for Bilal Yousaf/,
    );
  });

  it('refuses to accept a sheet that is not submitted or when marks are closed', () => {
    expect(reviewProblem({ ...base, sheetStatus: 'DRAFT' })).toMatch(
      /Only submitted/,
    );
    expect(reviewProblem({ ...base, examStatus: 'MARKS_CLOSED' })).toMatch(
      /not open/,
    );
  });

  it('returns a submitted sheet while marks are open', () => {
    expect(reviewProblem({ ...base, decision: 'RETURNED' })).toBeNull();
  });

  it('returns an accepted sheet only with a reason', () => {
    const accepted: ReviewInput = {
      ...base,
      decision: 'RETURNED',
      sheetStatus: 'ACCEPTED',
    };
    expect(reviewProblem(accepted)).toMatch(/reason/);
    expect(reviewProblem({ ...accepted, comment: '  ' })).toMatch(/reason/);
    expect(
      reviewProblem({ ...accepted, comment: 'New student added' }),
    ).toBeNull();
  });

  it('asks to reopen marks entry before returning when closed', () => {
    expect(
      reviewProblem({
        ...base,
        decision: 'RETURNED',
        sheetStatus: 'ACCEPTED',
        examStatus: 'MARKS_CLOSED',
        comment: 'x',
      }),
    ).toMatch(/Reopen marks entry first/);
  });

  it('never returns a draft sheet', () => {
    expect(
      reviewProblem({ ...base, decision: 'RETURNED', sheetStatus: 'DRAFT' }),
    ).toMatch(/Only submitted or accepted/);
  });
});

describe('reopenProblem', () => {
  it('reopens closed or approved (unpublished) exams', () => {
    expect(reopenProblem('MARKS_CLOSED', false)).toBeNull();
    expect(reopenProblem('RESULTS_APPROVED', false)).toBeNull();
  });

  it('refuses published, earlier states and a pending results approval', () => {
    expect(reopenProblem('PUBLISHED', false)).toMatch(/published/);
    expect(reopenProblem('MARKS_OPEN', false)).toMatch(/after it is closed/);
    expect(reopenProblem('SCHEDULED', false)).toMatch(/after it is closed/);
    expect(reopenProblem('MARKS_CLOSED', true)).toMatch(/awaiting approval/);
  });
});

describe('describePending', () => {
  it('names students, section and subject', () => {
    expect(
      describePending([
        {
          className: 'Grade 1',
          sectionName: 'A',
          subjectName: 'Urdu',
          students: ['Bilal Yousaf'],
        },
      ]),
    ).toBe('Bilal Yousaf (Grade 1 A · Urdu)');
  });

  it('shortens long lists', () => {
    const sheet = {
      className: 'Grade 1',
      sectionName: 'A',
      subjectName: 'Urdu',
      students: ['A', 'B', 'C', 'D', 'E'],
    };
    expect(describePending([sheet])).toBe(
      'A, B, C and 2 more (Grade 1 A · Urdu)',
    );
    expect(describePending(Array(7).fill(sheet))).toMatch(/and 2 more sheets$/);
  });
});
