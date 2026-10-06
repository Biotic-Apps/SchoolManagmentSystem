import { findClashes, overlaps, type SlotPaper } from './schedule-clash';

const paper = (overrides: Partial<SlotPaper>): SlotPaper => ({
  examId: 'e1',
  classId: 'c5',
  subjectId: 'math',
  date: '2026-11-02',
  startTime: '09:00',
  endTime: '11:00',
  roomId: null,
  ...overrides,
});

describe('schedule clash detection', () => {
  it('detects overlapping times on the same date only', () => {
    expect(
      overlaps(paper({}), paper({ startTime: '10:30', endTime: '12:00' })),
    ).toBe(true);
    expect(
      overlaps(paper({}), paper({ startTime: '11:00', endTime: '12:00' })),
    ).toBe(false);
    expect(overlaps(paper({}), paper({ date: '2026-11-03' }))).toBe(false);
    expect(
      overlaps(paper({}), paper({ startTime: '08:00', endTime: '13:00' })),
    ).toBe(true);
  });

  it('flags one class sitting two papers at once', () => {
    const clashes = findClashes([
      paper({}),
      paper({ subjectId: 'eng', startTime: '10:00', endTime: '12:00' }),
      paper({ classId: 'c4', subjectId: 'eng' }),
    ]);
    expect(clashes).toHaveLength(1);
    expect(clashes[0]).toMatchObject({ kind: 'CLASS', date: '2026-11-02' });
    expect(clashes[0].second.subjectId).toBe('eng');
  });

  it('flags a room booked twice, also against other exams', () => {
    const mine = [
      paper({ roomId: 'hall' }),
      paper({
        classId: 'c4',
        roomId: 'hall',
        startTime: '10:00',
        endTime: '12:00',
      }),
    ];
    expect(findClashes(mine).map((c) => c.kind)).toEqual(['ROOM']);
    const other = paper({
      examId: 'e2',
      classId: 'c3',
      roomId: 'hall',
      startTime: '08:00',
      endTime: '09:30',
    });
    expect(findClashes([paper({ roomId: 'hall' })], [other])).toHaveLength(1);
    expect(findClashes([paper({ roomId: 'lab' })], [other])).toHaveLength(0);
    expect(
      findClashes([paper({})], [paper({ examId: 'e2', subjectId: 'eng' })])[0]
        .kind,
    ).toBe('CLASS');
  });

  it('accepts a clean schedule', () => {
    expect(
      findClashes([
        paper({ roomId: 'hall' }),
        paper({ subjectId: 'eng', date: '2026-11-03', roomId: 'hall' }),
        paper({ classId: 'c4', roomId: 'lab' }),
      ]),
    ).toEqual([]);
  });
});
