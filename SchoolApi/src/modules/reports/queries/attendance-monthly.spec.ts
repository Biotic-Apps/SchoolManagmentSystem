import { buildAttendanceRows, type StudentMarkRow } from './attendance-monthly';

const mark = (
  studentId: string,
  status: StudentMarkRow['status'],
  className = 'Class 5',
  classOrder = 5,
  sectionName = 'A',
): StudentMarkRow => ({
  studentId,
  studentName: studentId === 's1' ? 'Zara Khan' : 'Ali Raza',
  admissionNo: `ADM-${studentId}`,
  className,
  classOrder,
  sectionName,
  status,
});

describe('buildAttendanceRows', () => {
  it('tallies per student with leave excluded from the percent base', () => {
    const rows = buildAttendanceRows([
      mark('s1', 'PRESENT'),
      mark('s1', 'LATE'),
      mark('s1', 'ABSENT'),
      mark('s1', 'HALF_DAY'),
      mark('s1', 'LEAVE'),
      mark('s2', 'PRESENT', 'Class 4', 4, 'B'),
    ]);
    expect(rows).toEqual([
      {
        className: 'Class 4',
        sectionName: 'B',
        admissionNo: 'ADM-s2',
        studentName: 'Ali Raza',
        present: 1,
        absent: 0,
        late: 0,
        leave: 0,
        halfDay: 0,
        marked: 1,
        percent: 100,
      },
      {
        className: 'Class 5',
        sectionName: 'A',
        admissionNo: 'ADM-s1',
        studentName: 'Zara Khan',
        present: 1,
        absent: 1,
        late: 1,
        leave: 1,
        halfDay: 1,
        marked: 5,
        percent: 62.5,
      },
    ]);
  });

  it('returns null percent when only leave is marked', () => {
    const [row] = buildAttendanceRows([mark('s1', 'LEAVE')]);
    expect(row.percent).toBeNull();
  });
});
