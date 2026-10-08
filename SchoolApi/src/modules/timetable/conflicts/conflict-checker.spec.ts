import {
  findConflicts,
  teachingKey,
  type ConflictInput,
} from './conflict-checker';

const base = (overrides: Partial<ConflictInput> = {}): ConflictInput => ({
  slots: [
    { day: 1, periodIndex: 1, subjectId: 'math', staffId: 't1', roomId: 'r1' },
  ],
  periodsOn: (day) =>
    new Map(
      (day === 5 ? [1, 2, 3] : [1, 2, 3, 4, 5, 6]).map((i) => [i, i === 4]),
    ),
  workingDays: new Set([1, 2, 3, 4, 5, 6]),
  others: [],
  teaching: new Set([teachingKey('t1', 'math')]),
  ...overrides,
});

const types = (input: ConflictInput) => findConflicts(input).map((c) => c.type);

describe('findConflicts', () => {
  it('accepts a clean timetable', () => {
    expect(findConflicts(base())).toEqual([]);
  });

  it('flags a teacher booked in another section at the same time', () => {
    const conflicts = findConflicts(
      base({
        others: [
          {
            sectionId: 's2',
            day: 1,
            periodIndex: 1,
            subjectId: 'math',
            staffId: 't1',
            roomId: 'r9',
          },
        ],
      }),
    );
    expect(conflicts).toEqual([
      expect.objectContaining({
        type: 'TEACHER_DOUBLE_BOOKED',
        otherSectionId: 's2',
      }),
    ]);
  });

  it('flags a room used by another section', () => {
    expect(
      types(
        base({
          others: [
            {
              sectionId: 's2',
              day: 1,
              periodIndex: 1,
              subjectId: 'eng',
              staffId: 't2',
              roomId: 'r1',
            },
          ],
        }),
      ),
    ).toEqual(['ROOM_DOUBLE_BOOKED']);
  });

  it('ignores other sections at different times', () => {
    expect(
      types(
        base({
          others: [
            {
              sectionId: 's2',
              day: 1,
              periodIndex: 2,
              subjectId: 'math',
              staffId: 't1',
              roomId: 'r1',
            },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it('flags unassigned teachers but accepts class teachers for any subject', () => {
    expect(types(base({ teaching: new Set() }))).toEqual([
      'TEACHER_NOT_ASSIGNED',
    ]);
    expect(
      types(base({ teaching: new Set([teachingKey('t1', '*')]) })),
    ).toEqual([]);
  });

  it('flags non-working days and break periods', () => {
    const slots = [
      {
        day: 7,
        periodIndex: 1,
        subjectId: 'math',
        staffId: 't1',
        roomId: null,
      },
      {
        day: 2,
        periodIndex: 4,
        subjectId: 'math',
        staffId: 't1',
        roomId: null,
      },
    ];
    expect(types(base({ slots }))).toEqual(['NON_WORKING_DAY', 'BREAK_PERIOD']);
  });

  it('gives every conflict a severity', () => {
    const conflicts = findConflicts(base({ teaching: new Set() }));
    expect(conflicts[0]).toMatchObject({
      type: 'TEACHER_NOT_ASSIGNED',
      severity: 'error',
    });
  });

  it('checks periods against the weekday schedule (Friday is shorter)', () => {
    const slots = [
      {
        day: 5,
        periodIndex: 5,
        subjectId: 'math',
        staffId: 't1',
        roomId: null,
      },
    ];
    expect(types(base({ slots }))).toEqual(['PERIOD_NOT_ON_DAY']);
  });

  it('reports clashes with other drafts as warnings, not when published already clashes', () => {
    const other = {
      sectionId: 's2',
      sectionName: 'Class 8 B',
      day: 1,
      periodIndex: 1,
      subjectId: 'eng',
      staffId: 't1',
      roomId: 'r1',
    };
    const drafts = findConflicts(base({ otherDrafts: [other] }));
    expect(drafts.map((c) => [c.type, c.severity])).toEqual([
      ['TEACHER_DRAFT_CLASH', 'warning'],
      ['ROOM_DRAFT_CLASH', 'warning'],
    ]);
    expect(drafts[0].message).toContain('Class 8 B');
    expect(
      types(base({ others: [other], otherDrafts: [other] })).sort(),
    ).toEqual(['ROOM_DOUBLE_BOOKED', 'TEACHER_DOUBLE_BOOKED']);
  });

  it('flags subjects outside the class curriculum', () => {
    const curriculum = new Map([
      ['eng', { name: 'English', periodsPerWeek: null }],
    ]);
    expect(types(base({ curriculum }))).toEqual(['SUBJECT_NOT_IN_CLASS']);
  });

  it('warns when weekly periods are exceeded or short', () => {
    const slot = (day: number) => ({
      day,
      periodIndex: 1,
      subjectId: 'math',
      staffId: 't1',
      roomId: null,
    });
    const over = findConflicts(
      base({
        slots: [slot(1), slot(2), slot(3)],
        curriculum: new Map([['math', { name: 'Maths', periodsPerWeek: 2 }]]),
      }),
    );
    expect(over).toEqual([
      expect.objectContaining({
        type: 'WEEKLY_PERIODS_EXCEEDED',
        severity: 'warning',
        day: 3,
      }),
    ]);
    const short = findConflicts(
      base({
        curriculum: new Map([['math', { name: 'Maths', periodsPerWeek: 6 }]]),
      }),
    );
    expect(short).toEqual([
      expect.objectContaining({
        type: 'WEEKLY_PERIODS_SHORT',
        day: 0,
        periodIndex: 0,
        message: 'Maths: 1 of 6 periods a week placed',
      }),
    ]);
  });

  it('warns when a teacher exceeds the daily limit across sections', () => {
    const others = [2, 3].map((periodIndex) => ({
      sectionId: 's2',
      day: 1,
      periodIndex,
      subjectId: 'math',
      staffId: 't1',
      roomId: null,
    }));
    expect(types(base({ others, maxPeriodsPerDay: 2 }))).toEqual([
      'TEACHER_DAY_LIMIT',
    ]);
    expect(types(base({ others, maxPeriodsPerDay: 3 }))).toEqual([]);
  });
});
