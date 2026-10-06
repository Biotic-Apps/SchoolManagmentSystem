import { FilePurpose } from '../../generated/prisma/client';
import { Scope, type ScopeIds } from '../rbac/scope/scope';
import { canAccessFile, type FileAccessContext } from './file-access.policy';

const SCHOOL = 'school-s';
const OTHER = 'school-t';
const ME = 'user-me';

const limited = (ids: Partial<ScopeIds>) =>
  Scope.createLimited({
    schoolIds: [],
    branchIds: [],
    sectionIds: [],
    memberSchoolIds: [],
    memberBranchIds: [],
    ...ids,
  });

type Role =
  | 'superAdmin'
  | 'principal'
  | 'branchAdmin'
  | 'otherPrincipal'
  | 'teacher'
  | 'parent';

const ROLES: Record<Role, Omit<FileAccessContext, 'userId'>> = {
  superAdmin: {
    scope: Scope.createGlobal(),
    permissions: new Set(['payroll.view', 'settings.edit']),
    managedBranchSchoolIds: new Set(),
  },
  principal: {
    scope: limited({ schoolIds: [SCHOOL], memberSchoolIds: [SCHOOL] }),
    permissions: new Set(['payroll.view', 'settings.view', 'settings.import']),
    managedBranchSchoolIds: new Set(),
  },
  branchAdmin: {
    scope: limited({
      branchIds: ['branch-b'],
      memberSchoolIds: [SCHOOL],
      memberBranchIds: ['branch-b'],
    }),
    permissions: new Set(['students.view']),
    managedBranchSchoolIds: new Set([SCHOOL]),
  },
  otherPrincipal: {
    scope: limited({ schoolIds: [OTHER], memberSchoolIds: [OTHER] }),
    permissions: new Set(['payroll.view', 'settings.edit']),
    managedBranchSchoolIds: new Set(),
  },
  teacher: {
    scope: limited({
      sectionIds: ['sec-1'],
      memberSchoolIds: [SCHOOL],
      memberBranchIds: ['branch-b'],
      sectionLimited: true,
    }),
    permissions: new Set(['payroll.view', 'settings.edit']),
    managedBranchSchoolIds: new Set(),
  },
  parent: {
    scope: limited({
      memberSchoolIds: [SCHOOL],
      studentIds: ['kid-1'],
      guardian: true,
    }),
    permissions: new Set(['students.view']),
    managedBranchSchoolIds: new Set(),
  },
};

const ORDER: Role[] = [
  'superAdmin',
  'principal',
  'branchAdmin',
  'otherPrincipal',
  'teacher',
  'parent',
];
//                         SA     P      BA     OP     T      Pa
const MANAGEMENT = [true, true, true, false, false, false];
const EXPECTED: Record<FilePurpose, boolean[]> = {
  SCHOOL_LOGO: [true, true, true, false, true, true],
  DOCUMENT: MANAGEMENT,
  ATTACHMENT: MANAGEMENT,
  STUDENT_PHOTO: MANAGEMENT,
  STAFF_PHOTO: MANAGEMENT,
  ID_CARD: MANAGEMENT,
  REPORT_CARD: MANAGEMENT,
  CHALLAN: MANAGEMENT,
  RECEIPT: MANAGEMENT,
  CERTIFICATE: MANAGEMENT,
  PAYSLIP: [true, true, false, false, false, false],
  IMPORT: [true, true, false, false, false, false],
  REPORT: [false, false, false, false, false, false],
};

const cases = Object.values(FilePurpose).flatMap((purpose) =>
  ORDER.map((role, i) => [purpose, role, EXPECTED[purpose][i]] as const),
);

describe('canAccessFile', () => {
  it('covers every purpose', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(
      Object.values(FilePurpose).sort(),
    );
  });

  it.each(cases)('%s × %s → %s', (purpose, role, expected) => {
    const file = { purpose, schoolId: SCHOOL, uploadedById: 'someone-else' };
    expect(canAccessFile(file, { ...ROLES[role], userId: ME })).toBe(expected);
  });

  it.each(cases)('%s × %s → uploader always allowed', (purpose, role) => {
    const file = { purpose, schoolId: SCHOOL, uploadedById: ME };
    expect(canAccessFile(file, { ...ROLES[role], userId: ME })).toBe(true);
  });

  it('school-less files are global-only (besides the uploader)', () => {
    const file = {
      purpose: FilePurpose.DOCUMENT,
      schoolId: null,
      uploadedById: 'x',
    };
    expect(canAccessFile(file, { ...ROLES.superAdmin, userId: ME })).toBe(true);
    expect(canAccessFile(file, { ...ROLES.principal, userId: ME })).toBe(false);
  });
});
