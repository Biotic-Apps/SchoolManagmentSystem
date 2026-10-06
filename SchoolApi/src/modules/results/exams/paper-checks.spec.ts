import { paperProblems, type PaperContext } from './paper-checks';

const context: PaperContext = {
  classIds: new Set(['c5']),
  classSubjects: new Set(['c5:math', 'c5:eng']),
  roomIds: new Set(['hall']),
  from: '2026-04-01',
  to: '2027-03-31',
};

const paper = {
  classId: 'c5',
  subjectId: 'math',
  date: '2026-11-02',
  startTime: '09:00',
  endTime: '11:00',
  maxMarks: 100,
  passMarks: 33,
  roomId: 'hall',
};

describe('paper checks', () => {
  it('accepts valid papers', () => {
    expect(
      paperProblems([paper, { ...paper, subjectId: 'eng' }], context),
    ).toEqual([]);
  });

  it('reports every field problem with its index', () => {
    expect(
      paperProblems(
        [
          paper,
          { ...paper, roomId: 'lab', date: '2027-04-01' },
          { ...paper, classId: 'c4' },
          { ...paper, subjectId: 'art', endTime: '09:00', passMarks: 101 },
        ],
        context,
      ),
    ).toEqual([
      { index: 1, problem: 'DUPLICATE_PAPER' },
      { index: 1, problem: 'OUTSIDE_SESSION' },
      { index: 1, problem: 'ROOM_NOT_IN_BRANCH' },
      { index: 2, problem: 'CLASS_NOT_IN_EXAM' },
      { index: 3, problem: 'SUBJECT_NOT_IN_CLASS' },
      { index: 3, problem: 'END_BEFORE_START' },
      { index: 3, problem: 'PASS_ABOVE_MAX' },
    ]);
  });
});
