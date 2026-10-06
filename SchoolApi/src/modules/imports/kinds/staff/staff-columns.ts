import type { ColumnSpec } from '../../validation/sheet';

const PHONE =
  'Pakistani mobile: 03001234567, 3001234567, +923001234567 or 00923001234567';

export const STAFF_COLUMNS: ColumnSpec[] = [
  {
    key: 'name',
    header: 'Name',
    required: true,
    format: 'Full name, letters incl. Urdu (max 100)',
    example: 'Sana Iqbal',
  },
  {
    key: 'designation',
    header: 'Designation',
    required: true,
    format:
      'TEACHER, HELPER, COORDINATOR, HEAD_TEACHER, ACCOUNTANT, OFFICE_STAFF or OTHER',
    example: 'TEACHER',
  },
  {
    key: 'phone',
    header: 'Phone',
    required: true,
    format: PHONE,
    example: '03111234567',
  },
  {
    key: 'email',
    header: 'Email',
    required: false,
    format: 'Email address',
    example: 'sana@example.com',
  },
  {
    key: 'cnic',
    header: 'CNIC',
    required: true,
    format: '12345-1234567-1 (dashes optional)',
    example: '35202-7654321-2',
  },
  {
    key: 'joiningDate',
    header: 'Joining date',
    required: true,
    format: 'YYYY-MM-DD or DD/MM/YYYY',
    example: '2024-08-01',
  },
  {
    key: 'roleKey',
    header: 'Role',
    required: false,
    format:
      'TEACHER, HELPER, COORDINATOR, HEAD_TEACHER or ACCOUNTANT (blank = from designation, else TEACHER)',
    example: 'TEACHER',
  },
  {
    key: 'assignments',
    header: 'Assignments',
    required: false,
    format:
      'CLASS_TEACHER:<class>-<section>; SUBJECT_TEACHER:<class>-<section>:<subject code> (separate with ;)',
    example: 'CLASS_TEACHER:5-A; SUBJECT_TEACHER:5-B:MATH',
  },
  {
    key: 'createAccount',
    header: 'Create account',
    required: false,
    format: 'yes or no (blank = no): staff login on the phone/email',
    example: 'yes',
  },
];

export const STAFF_NOTES = [
  'Assignments mini-syntax: entries separated by ";". CLASS_TEACHER:5-A makes the person class teacher of Class 5 section A; SUBJECT_TEACHER:5-B:MATH makes them the Mathematics (code MATH) teacher of Class 5 section B. The class may be written as 5 or "Class 5".',
  'A section can have one class teacher and one teacher per subject (existing ones are not replaced).',
  'New logins get a random password that is not shown: the person signs in with "Forgot password" (code to the phone/email).',
];
