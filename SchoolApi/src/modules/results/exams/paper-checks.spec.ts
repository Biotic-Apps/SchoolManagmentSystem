import { schoolHours } from './exam-schedule.service';
import {
  paperProblems,
  problemsMessage,
  problemText,
  type PaperContext,
} from './paper-checks';

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

describe('calendar checks', () => {
  const calendar: PaperContext = {
    ...context,
    workingDays: new Set([1, 2, 3, 4, 5, 6]),
    offDays: [
      {
        from: '2026-12-25',
        to: '2026-12-25',
        title: 'Quaid-e-Azam Day',
        type: 'HOLIDAY',
      },
      {
        from: '2026-12-20',
        to: '2026-12-31',
        title: 'Winter Vacation',
        type: 'VACATION',
      },
    ],
    opensAt: '08:00',
    closesAt: '14:00',
  };

  it('accepts a working day inside school hours', () => {
    expect(paperProblems([paper], calendar)).toEqual([]);
  });

  it('refuses a Sunday with a readable message', () => {
    const problems = paperProblems(
      [{ ...paper, date: '2026-12-06' }],
      calendar,
    );
    expect(problems).toEqual([
      {
        index: 0,
        problem: 'NON_WORKING_DAY',
        message: 'Sunday is not a working day for this branch',
      },
    ]);
    expect(problemsMessage(problems)).toBe(
      'Paper 1: Sunday is not a working day for this branch',
    );
  });

  it('names the holiday and refuses times outside school hours', () => {
    const problems = paperProblems(
      [{ ...paper, date: '2026-12-25', startTime: '23:00', endTime: '23:59' }],
      calendar,
    );
    expect(problems.map((p) => p.problem)).toEqual([
      'HOLIDAY',
      'OUTSIDE_SCHOOL_HOURS',
    ]);
    expect(problems[0].message).toBe(
      '25-Dec-2026 falls on Quaid-e-Azam Day (holiday)',
    );
    expect(problemText(problems[1])).toBe(
      'Times must be within school hours 08:00–14:00',
    );
  });

  it('reports vacations', () => {
    expect(
      paperProblems([{ ...paper, date: '2026-12-22' }], calendar)[0].problem,
    ).toBe('VACATION');
  });

  it('gives code texts for problems without a message', () => {
    expect(
      problemsMessage([
        { index: 2, problem: 'OUTSIDE_SESSION' },
        { index: 3, problem: 'X' },
      ]),
    ).toBe('Paper 3: The date is outside the academic session (and 1 more)');
  });
});

describe('schoolHours', () => {
  it('reads valid branch timings only', () => {
    expect(schoolHours({ opensAt: '08:00', closesAt: '14:00' })).toEqual({
      opensAt: '08:00',
      closesAt: '14:00',
    });
    expect(schoolHours(null)).toEqual({});
    expect(schoolHours({ opensAt: '8', closesAt: '14:00' })).toEqual({});
  });
});
