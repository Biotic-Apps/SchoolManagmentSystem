import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { Scope } from '../../../core/rbac/scope/scope';
import { assertCanEditBranch } from './branch-edit-policy';

const OWN = { id: 'branch-own', schoolId: 'school-1' };
const OTHER = { id: 'branch-other', schoolId: 'school-1' };
const TIMINGS = {
  timings: {
    opensAt: '08:00',
    closesAt: '14:00',
    attendanceLockAt: '11:00',
    staffArrivesAt: '07:15',
    staffLeavesAt: '14:30',
  },
  workingDays: [1, 2, 3, 4, 5],
};

const principalScope = () =>
  Scope.createLimited({
    schoolIds: [],
    branchIds: [OWN.id],
    sectionIds: [],
    memberSchoolIds: [OWN.schoolId],
    memberBranchIds: [OWN.id],
  });

const schoolAdminScope = () =>
  Scope.createLimited({
    schoolIds: [OWN.schoolId],
    branchIds: [],
    sectionIds: [],
    memberSchoolIds: [OWN.schoolId],
    memberBranchIds: [],
  });

const codeOf = (fn: () => void): unknown => {
  try {
    fn();
  } catch (error) {
    return (error as { code?: unknown }).code;
  }
  return null;
};

describe('assertCanEditBranch', () => {
  it('lets a principal change timings and working days of their own branch', () => {
    expect(() =>
      assertCanEditBranch(principalScope(), OWN, TIMINGS),
    ).not.toThrow();
  });

  it('refuses a principal on another branch, even in the same school', () => {
    expect(
      codeOf(() => assertCanEditBranch(principalScope(), OTHER, TIMINGS)),
    ).toBe(ErrorCode.FORBIDDEN_SCOPE);
  });

  it.each([{ name: 'Renamed' }, { code: 'NEW1' }])(
    'refuses a principal changing %o',
    (field) => {
      expect(
        codeOf(() =>
          assertCanEditBranch(principalScope(), OWN, { ...TIMINGS, ...field }),
        ),
      ).toBe(ErrorCode.FORBIDDEN);
    },
  );

  it('lets school administrators change name and code of any school branch', () => {
    const dto = { ...TIMINGS, name: 'Renamed', code: 'NEW1' };
    expect(() =>
      assertCanEditBranch(schoolAdminScope(), OTHER, dto),
    ).not.toThrow();
    expect(() =>
      assertCanEditBranch(Scope.createGlobal(), OWN, dto),
    ).not.toThrow();
  });
});
