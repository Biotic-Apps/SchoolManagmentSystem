import { skillRows } from '../report-cards/report-card.layout';
import { awardColumns, awardRows } from './award-list-layout';
import { dateSheetRows, paperDate, time12 } from './print-format';

describe('award list layout', () => {
  const subjects = new Map([
    ['m', 'Maths'],
    ['e', 'English'],
  ]);
  const papers = [
    { subjectId: 'm', maxMarks: 100 },
    { subjectId: 'e', maxMarks: 75 },
  ];

  it('has a column per subject with max marks and a total', () => {
    const columns = awardColumns(papers, subjects, false);
    expect(columns.map((c) => [c.header, c.sub ?? ''])).toEqual([
      ['Sr', ''],
      ['Roll', ''],
      ['Student', ''],
      ['Maths', '(100)'],
      ['English', '(75)'],
      ['Total', '(175)'],
    ]);
  });

  it('has marks / in words / remarks for a single paper', () => {
    const columns = awardColumns([papers[0]], subjects, true);
    expect(columns.map((c) => c.header)).toEqual([
      'Sr',
      'Roll',
      'Student',
      'Marks',
      'Marks in words',
      'Remarks',
    ]);
    expect(columns[3].sub).toBe('(out of 100)');
  });

  it('leaves mark cells blank', () => {
    const rows = awardRows(
      [
        { name: 'Ali', rollNo: 1 },
        { name: 'Sara', rollNo: null },
      ],
      2,
      false,
    );
    expect(rows).toEqual([
      ['1', '1', 'Ali', '', '', ''],
      ['2', '', 'Sara', '', '', ''],
      ['', '', '', '', '', ''],
      ['', '', '', '', '', ''],
    ]);
    expect(awardRows([{ name: 'Ali', rollNo: 4 }], 9, true)[0]).toHaveLength(6);
  });
});

describe('date sheet format', () => {
  it('formats dates and 12-hour times', () => {
    expect(paperDate(new Date('2026-10-12T00:00:00Z'))).toBe('Mon 12 Oct 2026');
    expect(time12('09:00')).toBe('9:00 AM');
    expect(time12('12:30')).toBe('12:30 PM');
    expect(time12('00:05')).toBe('12:05 AM');
    expect(time12('13:45')).toBe('1:45 PM');
  });

  it('sorts papers by date then start time', () => {
    const rows = dateSheetRows(
      [
        {
          date: new Date('2026-10-13T00:00:00Z'),
          startTime: '09:00',
          endTime: '11:00',
          subjectId: 'e',
          maxMarks: 75,
          passMarks: 30,
          roomId: 'r1',
        },
        {
          date: new Date('2026-10-12T00:00:00Z'),
          startTime: '09:00',
          endTime: '12:00',
          subjectId: 'm',
          maxMarks: 100,
          passMarks: 40,
          roomId: null,
        },
      ],
      new Map([
        ['m', 'Maths'],
        ['e', 'English'],
      ]),
      new Map([['r1', 'Hall']]),
    );
    expect(rows).toEqual([
      [
        'Mon 12 Oct 2026',
        'Monday',
        '9:00 AM – 12:00 PM',
        'Maths',
        '100',
        '40',
        '',
      ],
      [
        'Tue 13 Oct 2026',
        'Tuesday',
        '9:00 AM – 11:00 AM',
        'English',
        '75',
        '30',
        'Hall',
      ],
    ]);
  });
});

describe('report card skill rows', () => {
  it('pairs affective and psychomotor items side by side', () => {
    const rows = skillRows([
      {
        domain: 'AFFECTIVE',
        name: 'Punctuality',
        value: 5,
        code: 'A',
        label: 'Excellent',
      },
      {
        domain: 'AFFECTIVE',
        name: 'Neatness',
        value: 4,
        code: 'B',
        label: 'Very good',
      },
      {
        domain: 'PSYCHOMOTOR',
        name: 'Handwriting',
        value: 3,
        code: 'C',
        label: '',
      },
    ]);
    expect(rows).toEqual([
      ['Punctuality', 'A · Excellent', 'Handwriting', 'C'],
      ['Neatness', 'B · Very good', '', ''],
    ]);
  });
});
