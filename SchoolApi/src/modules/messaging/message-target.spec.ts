import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { mergeStaffOptions, pickStaffTarget } from './message-target';

const options = mergeStaffOptions([
  { userId: 'ct', name: 'Class T', role: 'CLASS_TEACHER' },
  {
    userId: 'ct',
    name: 'Class T',
    role: 'SUBJECT_TEACHER',
    subjectName: 'Maths',
  },
  {
    userId: 'st',
    name: 'Sub T',
    role: 'SUBJECT_TEACHER',
    subjectName: 'English',
  },
  { userId: 'st', name: 'Sub T', role: 'SUBJECT_TEACHER', subjectName: 'Urdu' },
  {
    userId: null,
    name: 'No login',
    role: 'SUBJECT_TEACHER',
    subjectName: 'Art',
  },
  { userId: 'p', name: 'Principal', role: 'PRINCIPAL' },
]);

const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as AppError).code;
  }
  return null;
};

describe('message target', () => {
  it('dedupes by user and drops staff without a login', () => {
    expect(options.map((o) => o.userId)).toEqual(['ct', 'st', 'p']);
    expect(options[0]).toMatchObject({
      role: 'CLASS_TEACHER',
      subjectName: 'Maths',
    });
    expect(options[1].subjectName).toBe('English, Urdu');
  });

  it('defaults to the class teacher', () => {
    expect(pickStaffTarget(options).userId).toBe('ct');
  });

  it('accepts a listed staff member', () => {
    expect(pickStaffTarget(options, 'p').role).toBe('PRINCIPAL');
  });

  it('forbids anyone else', () => {
    expect(codeOf(() => pickStaffTarget(options, 'other'))).toBe(
      ErrorCode.FORBIDDEN,
    );
  });

  it('conflicts when there is no class teacher to default to', () => {
    expect(codeOf(() => pickStaffTarget([options[2]]))).toBe(
      ErrorCode.CONFLICT,
    );
  });
});
