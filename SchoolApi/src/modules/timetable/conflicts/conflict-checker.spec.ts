import {
  findConflicts,
  teachingKey,
  type ConflictInput,
} from './conflict-checker';

const base = (overrides: Partial<ConflictInput> = {}): ConflictInput => ({
  slots: [
    { day: 1, periodIndex: 1, subjectId: 'math', staffId: 't1', roomId: 'r1' },
  ],
  breakPeriods: new Set([4]),
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
});
