import { checkRows, pendingStudents } from './mark-rows';

const roster = new Set(['s1', 's2', 's3']);

describe('mark rows', () => {
  it('normalizes marks, absent and pending rows', () => {
    const { rows, problems } = checkRows(
      [
        { studentId: 's1', marks: 45.5, absent: false, remark: ' good ' },
        { studentId: 's2', marks: 30, absent: true },
        { studentId: 's3', marks: null, absent: false },
      ],
      50,
      roster,
    );
    expect(problems).toEqual([]);
    expect(rows).toEqual([
      { studentId: 's1', marksH: 4550, absent: false, remark: 'good' },
      { studentId: 's2', marksH: null, absent: true, remark: null },
      { studentId: 's3', marksH: null, absent: false, remark: null },
    ]);
  });

  it('rejects out-of-range marks, strangers, duplicates and extra decimals', () => {
    const { problems } = checkRows(
      [
        { studentId: 's1', marks: 50.01, absent: false },
        { studentId: 's2', marks: -1, absent: false },
        { studentId: 'x', marks: 1, absent: false },
        { studentId: 's3', marks: 1.234, absent: false },
        { studentId: 's3', marks: 50, absent: false },
      ],
      50,
      roster,
    );
    expect(problems).toEqual([
      { studentId: 's1', problem: 'ABOVE_MAX' },
      { studentId: 's2', problem: 'NEGATIVE' },
      { studentId: 'x', problem: 'NOT_IN_SECTION' },
      { studentId: 's3', problem: 'TOO_MANY_DECIMALS' },
      { studentId: 's3', problem: 'DUPLICATE' },
    ]);
  });

  it('lists pending roster students (zero is entered, absent is not pending)', () => {
    const entered = new Map([
      ['s1', { marksH: 0, absent: false }],
      ['s2', { marksH: null, absent: true }],
      ['s3', { marksH: null, absent: false }],
    ]);
    expect(pendingStudents(['s1', 's2', 's3', 's4'], entered)).toEqual([
      's3',
      's4',
    ]);
  });
});
