/**
 * Writes the sample import files (students.xlsx + students.csv) for the
 * demo seed: 6 Class 1-A students, one Urdu name, one invalid phone (row 7).
 * Run: npx ts-node prisma/seed/fixtures/make-fixtures.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ExcelJS from 'exceljs';

export const STUDENT_FIXTURE: string[][] = [
  [
    'Name',
    'Gender',
    'Date of birth',
    'Class',
    'Section',
    'Roll no',
    'Admission no',
    'Admission date',
    'Address',
    'Father/guardian name',
    'Guardian relation',
    'Guardian phone',
    'Guardian CNIC',
  ],
  [
    'Ahmed Ali',
    'MALE',
    '2020-03-14',
    'Class 1',
    'A',
    '',
    '',
    '',
    'Model Town, Lahore',
    'Ali Hassan',
    'FATHER',
    '03214567801',
    '35202-1111111-1',
  ],
  [
    'علی رضا',
    'MALE',
    '12/05/2020',
    'Class 1',
    'A',
    '',
    '',
    '',
    'Johar Town, Lahore',
    'رضا احمد',
    'FATHER',
    '3214567802',
    '',
  ],
  [
    'Fatima Noor',
    'FEMALE',
    '2020-07-01',
    'Class 1',
    'A',
    '',
    '',
    '',
    '',
    'Noor Khan',
    'FATHER',
    '+923214567803',
    '',
  ],
  [
    'Hira Aslam',
    'F',
    '23/09/2020',
    'Class 1',
    'A',
    '',
    '',
    '',
    '',
    'Sadia Aslam',
    'MOTHER',
    '00923214567804',
    '',
  ],
  [
    'Usman Tariq',
    'M',
    '2020-11-30',
    'Class 1',
    'A',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ],
  [
    'Zainab Bibi',
    'FEMALE',
    '2020-02-10',
    'Class 1',
    'A',
    '',
    '',
    '',
    '',
    'Bashir Ahmad',
    'FATHER',
    '0321-45',
    '',
  ],
];

const csvCell = (v: string) =>
  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

async function main(): Promise<void> {
  const dir = __dirname;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Students', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  for (const line of STUDENT_FIXTURE) sheet.addRow(line);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => (column.width = 18));
  writeFileSync(
    join(dir, 'students.xlsx'),
    Buffer.from(await workbook.xlsx.writeBuffer()),
  );
  const csv = STUDENT_FIXTURE.map((l) => l.map(csvCell).join(',')).join('\r\n');
  writeFileSync(join(dir, 'students.csv'), `\uFEFF${csv}\r\n`, 'utf8');
}

if (require.main === module) {
  void main();
}
