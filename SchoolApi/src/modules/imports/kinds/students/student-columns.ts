import type { ColumnSpec } from '../../validation/sheet';

const DATE = 'YYYY-MM-DD or DD/MM/YYYY';
const PHONE =
  'Pakistani mobile: 03001234567, 3001234567, +923001234567 or 00923001234567';

export const STUDENT_COLUMNS: ColumnSpec[] = [
  {
    key: 'name',
    header: 'Name',
    required: true,
    format: 'Full name, letters incl. Urdu (max 100)',
    example: 'Ali Raza',
  },
  {
    key: 'gender',
    header: 'Gender',
    required: true,
    format: 'MALE, FEMALE or OTHER (M/F accepted)',
    example: 'MALE',
  },
  {
    key: 'dob',
    header: 'Date of birth',
    required: true,
    format: DATE,
    example: '2016-04-12',
  },
  {
    key: 'class',
    header: 'Class',
    required: true,
    format: 'Class name as set up, e.g. "Class 5" or 5',
    example: 'Class 5',
  },
  {
    key: 'section',
    header: 'Section',
    required: true,
    format: 'Section name in that class, e.g. A',
    example: 'A',
  },
  {
    key: 'rollNo',
    header: 'Roll no',
    required: false,
    format: 'Whole number, unique in the section (blank = next free)',
    example: '',
  },
  {
    key: 'admissionNo',
    header: 'Admission no',
    required: false,
    format: 'Unique in the school (blank = generated)',
    example: '',
  },
  {
    key: 'admissionDate',
    header: 'Admission date',
    required: false,
    format: `${DATE} (blank = today)`,
    example: '',
  },
  {
    key: 'bForm',
    header: 'B-Form',
    required: false,
    format: '13 digits, e.g. 12345-1234567-1',
    example: '',
  },
  {
    key: 'address',
    header: 'Address',
    required: false,
    format: 'Text (max 300)',
    example: 'House 12, Street 4, Lahore',
  },
  {
    key: 'fatherName',
    header: 'Father/guardian name',
    required: false,
    format: 'Name; needs Guardian phone',
    example: 'Raza Ahmed',
  },
  {
    key: 'guardianRelation',
    header: 'Guardian relation',
    required: false,
    format: 'FATHER, MOTHER, GUARDIAN or OTHER (blank = FATHER)',
    example: 'FATHER',
  },
  {
    key: 'guardianPhone',
    header: 'Guardian phone',
    required: false,
    format: PHONE,
    example: '03001234567',
  },
  {
    key: 'guardianCnic',
    header: 'Guardian CNIC',
    required: false,
    format: '12345-1234567-1 (dashes optional)',
    example: '35202-1234567-1',
  },
];

export const STUDENT_NOTES = [
  'One row per student. Students are enrolled (ACTIVE) in the section of the session chosen on upload.',
  'A guardian with the same phone already in the school is reused and linked as the primary guardian.',
];
