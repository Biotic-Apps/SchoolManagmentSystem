import { mapSheet } from '../../validation/sheet';
import { sectionKey } from '../shared/academic-refs';
import { StudentValidator, type StudentContext } from './student-validator';

const HEADER = [
  'Name',
  'Gender',
  'Date of birth',
  'Class',
  'Section',
  'Roll no',
  'Admission no',
  'Guardian phone',
  'Father/guardian name',
];

function ctx(overrides: Partial<StudentContext> = {}): StudentContext {
  return {
    refs: {
      classes: new Map(),
      sections: new Map([
        [
          sectionKey('Class 5', 'A'),
          {
            id: 's5a',
            classId: 'c5',
            label: 'Class 5-A',
            capacity: 3,
            rollNos: new Set([1]),
            active: 1,
          },
        ],
      ]),
    },
    takenAdmissionNos: new Set(['ESC-2026-0001']),
    today: '2026-10-06',
    ...overrides,
  };
}

function run(lines: string[][], context = ctx()) {
  const validator = new StudentValidator();
  const sheet = mapSheet([HEADER, ...lines], validator.columns);
  const rows = sheet.rows.map((row) => validator.parse(row));
  validator.check(rows, context);
  return { sheet, rows };
}

describe('StudentValidator', () => {
  it('accepts valid rows incl. Urdu names and both date formats', () => {
    const { rows } = run([
      [
        'علی رضا',
        'M',
        '12/04/2016',
        '5',
        'a',
        '',
        '',
        '03001234567',
        'رضا احمد',
      ],
      ['Sara Khan', 'female', '2016-01-31', 'Class 5', 'A', '2', 'X-1', '', ''],
    ]);
    expect(rows.map((r) => r.errors)).toEqual([[], []]);
    expect(rows[0].data).toMatchObject({
      name: 'علی رضا',
      gender: 'MALE',
      dob: '2016-04-12',
      sectionId: 's5a',
      guardian: {
        name: 'رضا احمد',
        phone: '+923001234567',
        relation: 'FATHER',
      },
    });
  });

  it('reports row/column errors with spreadsheet row numbers', () => {
    const { rows } = run([
      ['Ali', 'M', '31/02/2016', '5', 'A', '', '', '0300', 'Raza'],
      ['', 'X', '2016-01-01', '9', 'Z', '', '', '', ''],
    ]);
    expect(rows[0].errors).toEqual([
      expect.objectContaining({ row: 2, column: 'Guardian phone' }),
      expect.objectContaining({ row: 2, column: 'Date of birth' }),
    ]);
    const columns = rows[1].errors.map((e) => e.column);
    expect(columns).toEqual(
      expect.arrayContaining(['Name', 'Gender', 'Section']),
    );
    expect(rows[1].row).toBe(3);
  });

  it('flags duplicates within the file and against the DB', () => {
    const { rows } = run([
      ['Ali', 'M', '2016-01-01', '5', 'A', '2', 'A-7', '', ''],
      ['Bilal', 'M', '2016-01-01', '5', 'A', '2', 'A-7', '', ''],
      ['Ali', 'M', '2016-01-01', '5', 'A', '1', 'ESC-2026-0001', '', ''],
    ]);
    expect(rows[1].errors.map((e) => e.message)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Duplicate admission no \(same as row 2\)/),
      ]),
    );
    const third = rows[2].errors.map((e) => e.message).join(' | ');
    expect(third).toMatch(/Duplicate student/);
    expect(third).toMatch(/already exists/);
  });

  it('enforces roll numbers and section capacity', () => {
    const { rows } = run([
      ['A One', 'M', '2016-01-01', '5', 'A', '1', '', '', ''],
      ['B Two', 'M', '2016-01-01', '5', 'A', '', '', '', ''],
      ['C Three', 'M', '2016-01-01', '5', 'A', '', '', '', ''],
      ['D Four', 'M', '2016-01-01', '5', 'A', '', '', '', ''],
    ]);
    expect(rows[0].errors[0].message).toMatch(/Roll no 1 is already taken/);
    expect(rows[3].errors[0].message).toMatch(/full/);
  });

  it('reports a missing required column once', () => {
    const validator = new StudentValidator();
    const sheet = mapSheet(
      [
        ['Name', 'Gender'],
        ['Ali', 'M'],
      ],
      validator.columns,
    );
    expect(sheet.errors.map((e) => e.column)).toEqual([
      'Date of birth',
      'Class',
      'Section',
    ]);
  });
});
