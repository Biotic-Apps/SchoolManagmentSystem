import { ErrorCode } from '../../common/errors/error-code.enum';
import type { ActiveAssignment } from '../access/active-assignment';
import { ScopeService } from './scope.service';

const assignment = (
  overrides: Partial<ActiveAssignment>,
): ActiveAssignment => ({
  id: 'a',
  roleId: 'r',
  roleKey: 'PRINCIPAL',
  roleName: 'Principal',
  scopeType: 'BRANCH',
  schoolId: 'school-1',
  schoolName: 'S',
  branchId: 'branch-1',
  branchName: 'B',
  sectionId: null,
  subjectId: null,
  validFrom: new Date(0).toISOString(),
  validUntil: null,
  ...overrides,
});

describe('ScopeService', () => {
  it('GLOBAL gives unrestricted scope and empty filters', () => {
    const scope = ScopeService.resolve([
      assignment({ scopeType: 'GLOBAL', schoolId: null, branchId: null }),
    ]);
    expect(scope.global).toBe(true);
    expect(scope.branchFilter()).toEqual({});
    expect(scope.canManageBranch({ id: 'any', schoolId: 'any' })).toBe(true);
  });

  it('BRANCH manages only its branch and reads its school', () => {
    const scope = ScopeService.resolve([assignment({})]);
    expect(
      scope.canManageBranch({ id: 'branch-1', schoolId: 'school-1' }),
    ).toBe(true);
    expect(
      scope.canManageBranch({ id: 'branch-2', schoolId: 'school-1' }),
    ).toBe(false);
    expect(scope.canReadSchool('school-1')).toBe(true);
    expect(scope.canManageSchool('school-1')).toBe(false);
    let code: string | undefined;
    try {
      scope.assertReadBranch({ id: 'branch-2', schoolId: 'school-1' });
    } catch (error) {
      code = (error as { code: string }).code;
    }
    expect(code).toBe(ErrorCode.FORBIDDEN_SCOPE);
  });

  it('SCHOOL covers every branch of the school', () => {
    const scope = ScopeService.resolve([
      assignment({ scopeType: 'SCHOOL', branchId: null }),
    ]);
    expect(
      scope.canManageBranch({ id: 'new-branch', schoolId: 'school-1' }),
    ).toBe(true);
    expect(scope.canManageBranch({ id: 'x', schoolId: 'school-2' })).toBe(
      false,
    );
    expect(scope.branchFilter()).toEqual({
      OR: [{ schoolId: { in: ['school-1'] } }, { branchId: { in: [] } }],
    });
  });

  it('SECTION reads its branch but does not manage it', () => {
    const scope = ScopeService.resolve([
      assignment({ scopeType: 'SECTION', sectionId: 'sec-1' }),
    ]);
    expect(scope.sectionIds.has('sec-1')).toBe(true);
    expect(scope.canReadBranch({ id: 'branch-1', schoolId: 'school-1' })).toBe(
      true,
    );
    expect(
      scope.canManageBranch({ id: 'branch-1', schoolId: 'school-1' }),
    ).toBe(false);
  });

  it('merges several assignments of the active role', () => {
    const scope = ScopeService.resolve([
      assignment({}),
      assignment({ id: 'b', branchId: 'branch-9', schoolId: 'school-9' }),
    ]);
    expect([...scope.branchIds].sort()).toEqual(['branch-1', 'branch-9']);
    expect(scope.canReadSchool('school-9')).toBe(true);
  });

  it('no assignments means no access', () => {
    const scope = ScopeService.resolve([]);
    expect(scope.global).toBe(false);
    expect(scope.canReadSchool('school-1')).toBe(false);
  });
});
